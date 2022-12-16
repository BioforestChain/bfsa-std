import { createMessage } from "../gateway/network.ts";
import { MapEventEmitter as EventEmitter } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/event-map_emitter/index.ts';
import { PromiseOut } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts';
import { EasyMap } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-map/EasyMap.ts';

/**
 * 所有的dweb-plugin需要继承这个类
 */
export class DwebPlugin extends HTMLElement {


  protected listeners: { [eventName: string]: ListenerCallback[] } = {};
  protected windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  event = new EventEmitter<{ response: [EmitResponse] }>();
  request_data = EasyMap.from({
    creater(_func: string) {
      return {
        op: new PromiseOut<ArrayBuffer | string>()
      }
    }
  })

  private isWaitingData = 0;
  /**反压高水位，暴露给开发者控制 */
  hightWaterMark = 10;
  /** 用来区分不同的Dweb-plugin建议使用英文单词，单元测试需要覆盖中文和特殊字符传输情况*/
  constructor() {
    super();
    this.event.on("response", ({ func, data }) => {
      console.log("plguin#EmitResponse:", func, data)
      this.request_data.forceGet(func).op.resolve(data)
    })
  }
  /**接收kotlin的evaJs来的string */
  dispatchStringMessage = (func: string, data: string) => {
    console.log("dweb-plugin dispatchStringMessage:", data);
    if (this.isWaitingData > this.hightWaterMark) {
      return;
    }
    this.isWaitingData++;
    this.event.emit("response", { func, data });
  };
  /**接收kotlin的evaJs来的buffer */
  dispatchBinaryMessage = (func: string, buf: ArrayBuffer) => {
    console.log("dweb-plugin dispatchBinaryMessage:", buf);
    this.event.emit("response", { func, data: buf });
  };

  /**
   * @param fun 操作函数
   * @param data 数据
   * @returns Promise<Ok>
   */
  async onRequest(
    fun: string,
    data = `"''"`,
  ): Promise<string | ArrayBuffer> {
    // 发送请求
    const ok = await createMessage(fun, data);
    if (ok !== "ok") {
      return `${fun}操作失败`; // todo 记录日志
    }
    return await this.request_data.forceGet(fun).op.promise
  }

  addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listenerFunc);

    // 看看有没有添加过监听
    const windowListener = this.windowListeners[eventName];
    if (windowListener && !windowListener.registered) {
      this.addWindowListener(windowListener);
    }
    const remove = () => this.removeListener(eventName, listenerFunc);

    // deno-lint-ignore no-explicit-any
    const p: any = Promise.resolve({ remove });
    // 注册一个移除监听的方法
    Object.defineProperty(p, 'remove', {
      value: async () => {
        console.warn(`Using addListener() without 'await' is deprecated.`);
        await remove();
      },
    });

    return p;
  }
  /**添加一个监听器 */
  private addWindowListener(handle: WindowListenerHandle): void {
    // deno-lint-ignore no-window-prefix
    window.addEventListener(handle.windowEventName, handle.handler);
    handle.registered = true;
  }
  private removeListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ) {
    const listeners = this.listeners[eventName];
    if (!listeners) {
      return;
    }

    const index = listeners.indexOf(listenerFunc);
    this.listeners[eventName].splice(index, 1);

    // 如果监听器为空，移除监听器
    if (!this.listeners[eventName].length) {
      this.removeWindowListener(this.windowListeners[eventName]);
    }
  }

  private removeWindowListener(handle: WindowListenerHandle): void {
    if (!handle) {
      return;
    }
    // deno-lint-ignore no-window-prefix
    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }

}
type EmitResponse = {
  func: string,
  data: string | ArrayBuffer
}

// deno-lint-ignore no-explicit-any
export type ListenerCallback = (err: any, ...args: any[]) => void;

export interface WindowListenerHandle {
  registered: boolean;
  windowEventName: string;
  pluginEventName: string;
  // deno-lint-ignore no-explicit-any
  handler: (event: any) => void;
}

export interface PluginListenerHandle {
  remove: () => Promise<void>;
}

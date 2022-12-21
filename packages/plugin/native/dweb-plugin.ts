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
        op: new PromiseOut<ArrayBufferView | string>()
      }
    }
  })

  /** 用来区分不同的Dweb-plugin建议使用英文单词，单元测试需要覆盖中文和特殊字符传输情况*/
  constructor() {
    super();
    this.event.on("response", ({ func, data }) => {
      console.log("🍙plugin#EmitResponse:", func, data)
      this.request_data.forceGet(func).op.resolve(data)
    })
  }
  /**接收kotlin的evaJs来的string */
  dispatchStringMessage = (func: string, data: string) => {
    console.log("🍙plugin#dispatchStringMessage:", func, data);
    this.event.emit("response", { func, data });
  };
  /**接收kotlin的evaJs来的buffer */
  dispatchBinaryMessage = (func: string, buf: ArrayBuffer) => {
    console.log("🍙plugin#dispatchBinaryMessage:", func, buf); // 未测试
    this.event.emit("response", { func, data: new Uint8Array(buf) });
  };

  /**
   * @param fun 操作函数
   * @param data 数据
   * @returns Promise<Ok>
   */
  async onRequest(
    fun: string,
    data = "''",
  ): Promise<string | ArrayBufferView> {
    // 发送请求
    const ok = await createMessage(fun, data);
    console.log("🍙plugin#onRequest", fun, ok)
    return await this.request_data.forceGet(fun).op.promise
  }
  /**
   *  dwebview 注册一个监听事件
   * @param eventName 
   * @param listenerFunc 
   * @returns 
   */
  addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    // 监听一个事件
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

  /**移除监听器 */
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

  /**移除全局监听 */
  private removeWindowListener(handle: WindowListenerHandle): void {
    if (!handle) {
      return;
    }
    // deno-lint-ignore no-window-prefix
    window.removeEventListener(handle.windowEventName, handle.handler);
    handle.registered = false;
  }
  /**移动端通知调用 */
  // deno-lint-ignore no-explicit-any
  protected notifyListeners(eventName: string, data: any): void {
    console.log("🍙plugin#notifyListeners:", eventName, data)
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
  /**是否存在 */
  protected hasListeners(eventName: string): boolean {
    return !!this.listeners[eventName].length;
  }

}
type EmitResponse = {
  func: string,
  data: string | ArrayBufferView
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

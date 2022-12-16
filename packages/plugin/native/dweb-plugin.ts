import { loop } from "../common/index.ts";
import { createMessage } from "../gateway/network.ts";
/**
 * 所有的dweb-plugin需要继承这个类
 */
export class DwebPlugin extends HTMLElement {

  protected listeners: { [eventName: string]: ListenerCallback[] } = {};
  protected windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  private isWaitingData = 0;
  asyncDataArr: string[] = []; // 存储迭代目标
  /**反压高水位，暴露给开发者控制 */
  hightWaterMark = 10;
  /** 用来区分不同的Dweb-plugin建议使用英文单词，单元测试需要覆盖中文和特殊字符传输情况*/
  // channelId = "";
  constructor() {
    super();
  }
  /**接收kotlin的evaJs来的string */
  dispatchStringMessage = (data: string) => {
    console.log("dweb-plugin dispatchStringMessage:", data);
    if (this.isWaitingData > this.hightWaterMark) {
      return;
    }
    this.isWaitingData++;
    this.asyncDataArr.push(data);
  };
  /**接收kotlin的evaJs来的buffer，转为string */
  dispatchBinaryMessage = (buf: ArrayBuffer) => {
    console.log("dweb-plugin dispatchBinaryMessage:", buf);
    const data = new TextDecoder("utf-8").decode(new Uint8Array(buf)); // 需要测试特殊字符和截断问题
    console.log("dweb-plugin dispatchBinaryMessage:", data);
    this.asyncDataArr.push(data);
  };
  /**迭代器生成函数*/
  onMesage() {
    return {
      next: () => {
        const data = this.asyncDataArr.shift();
        if (data) {
          return {
            value: data,
            done: false,
          };
        }
        return { value: "", done: true };
      },
    };
  }
  /**
   * @param fun 操作函数
   * @param data 数据
   * @returns Promise<Ok>
   */
  async onPolling(
    fun: string,
    data = `"''"`,
    delay = 500,
  ): Promise<string> {
    const ok = await createMessage(fun, data);
    let index = 1;

    if (ok !== "ok") {
      return `${fun}操作失败`; // todo 记录日志
    }
    do {
      const data = await this.onMesage().next();
      if (data.done === false) {
        return data.value;
      }
      index++;
      await loop(delay);
    } while (index < 10);
    return `${fun}操作超时`
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

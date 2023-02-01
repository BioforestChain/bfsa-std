



import { MapEventEmitter as EventEmitter } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/event-map_emitter/index.ts';
import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts";
import { EasyMap } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-map/EasyMap.ts';


/**
 * ios 回调触发listerIosSetUiCallback函数，来返回真正的值
 * 
 */
export class NativeListen {
  event = new EventEmitter<{ response: [EmitResponse] }>();
  request_data = EasyMap.from({
    creater(_func: string) {
      return {
        op: new PromiseOut<ArrayBufferView | string>()
      }
    }
  })
  constructor() {
    this.event.on("response", ({ cmd, data }) => {
      console.log("🍙plugin#EmitResponse:", cmd, data)
      this.request_data.forceGet(cmd).op.resolve(data)
    })
  }

  /**接收native的evaJs来的string */
  dispatchStringMessage = (cmd: string, data: string) => {
    console.log("🍙plugin#dispatchStringMessage:", cmd, data);
    this.event.emit("response", { cmd, data });
  };
  /**接收native的evaJs来的buffer */
  dispatchBinaryMessage = (cmd: string, buf: ArrayBuffer) => {
    console.log("🍙plugin#dispatchBinaryMessage:", cmd, buf); // 未测试
    this.event.emit("response", { cmd, data: new Uint8Array(buf) });
  };


  /**
 * 处理native事件转发
 * @param url 
 */
  async eventGetSetUi(cmd: string, url: string) {
    console.log(`plugin#eventGetSetUi: ${cmd}`);
    // dnt-shim-ignore
    // deno-lint-ignore no-explicit-any
    (window as any).BFSGetConnectChannel(url);

    return await this.request_data.forceGet(cmd).op.promise
  }

  /**
* 处理native事件转发
* @param url 
*/
  async eventGetPoll(cmd: string, url: string) {
    console.log(`plugin#eventGetPoll: ${cmd}`);
    // dnt-shim-ignore
    // deno-lint-ignore no-explicit-any
    await (window as any).BFSGetConnectChannel(url);
    return await this.request_data.forceGet(cmd).op.promise
  }




  /**
   * 处理ios事件转发
   * @param url 
   * @param body 
   */
  async eventPostChannel(cmd: string, url: string, buffer: Blob) {
    console.log("plugin#eventIosPostChannel:", url, buffer.size)
    const body = buffer.stream();
    // deno-lint-ignore no-explicit-any
    const reader: ReadableStreamDefaultReader<Uint8Array> = (body as any).getReader();
    do {
      const { done, value } = await reader.read();
      if (done) {
        // dnt-shim-ignore
        // deno-lint-ignore no-explicit-any
        (window as any).BFSPostConnectChannel(url, cmd, "0");
        break;
      }
      // dnt-shim-ignore
      // deno-lint-ignore no-explicit-any
      (window as any).BFSPostConnectChannel(url, cmd, value.join(","));
    } while (true);
    return await this.request_data.forceGet(cmd).op.promise
  }
}

type EmitResponse = {
  cmd: string,
  data: string | ArrayBufferView
}
// dnt-shim-ignore
// deno-lint-ignore no-explicit-any
(window as any).nativeListen = new NativeListen()

// dnt-shim-ignore
// deno-lint-ignore no-explicit-any
export const nativeListen = (window as any).nativeListen


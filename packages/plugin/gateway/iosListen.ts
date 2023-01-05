



import { MapEventEmitter as EventEmitter } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/event-map_emitter/index.ts';
import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts";
import { EasyMap } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-map/EasyMap.ts';

/**
 * ios 回调触发listerIosSetUiCallback函数，来返回真正的值
 * 
 */
export class IosListen {
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

  listerIosSetUiCallback(cmd: string, data: string) {
    this.event.emit("response", { cmd, data });
  }

  /**
 * 处理ios事件转发
 * @param url 
 */
  async eventIosGetSetUi(cmd: string, url: string) {
    // deno-lint-ignore no-explicit-any
    (window as any).getConnectChannel(url);
    return await this.request_data.forceGet(cmd).op.promise
  }

  /**
* 处理ios事件转发
* @param url 
*/
  async eventIosGetPoll(url: string) {
    // deno-lint-ignore no-explicit-any
    await (window as any).getConnectChannel(url);
    return "ok"
  }




  /**
   * 处理ios事件转发
   * @param url 
   * @param body 
   */
  async eventIosPostChannel(cmd: string, url: string, buffer: Blob) {
    console.log("plugin#eventIosPostChannel:", url, buffer.size)
    const body = buffer.stream();
    const reader = body.getReader();
    do {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // deno-lint-ignore no-explicit-any
      (window as any).postConnectChannel(url, value);
    } while (true);
    return await this.request_data.forceGet(cmd).op.promise
  }
}

type EmitResponse = {
  cmd: string,
  data: string | ArrayBufferView
}


export const iosListen = new IosListen()

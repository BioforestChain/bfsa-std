import { network } from "../../deno/network.ts";
import { hexToBinary, bufferToString } from '../../../util/binary.ts';
import { callNative, callDVebView } from "../../native/native.fn.ts";
import { ECommand, IChannelConfig } from "@bfsx/typings";
import { EventPollQueue, request_body_cache } from "./index.ts";


export class RequestEvent {
  constructor(readonly request: Request, readonly response: RequestResponse, readonly channelId: string, readonly bodyId: number) {

  }
  // @cacheGetter
  get url() {
    return new URL(this.request.url, 'https://localhost')
  }
}
export class RequestResponse {
  constructor(private _bodyCtrl: ReadableStreamController<Uint8Array | string | ArrayBuffer | Blob>, private _onClose: (statusCode: number, headers: Record<string, string>) => void) {
  }
  public statusCode = 200
  public headers: Record<string, string> = {}
  setHeaders(key: string, value: string) {
    this.headers[key] = value
  }
  getHeaders(key: string) {
    return this.headers[key]
  }
  private _closed = false
  write(data: Uint8Array | string | ArrayBuffer | Blob) {
    if (this._closed) {
      throw new Error('closed')
    }
    // if (typeof data === 'string') {
    //   data = stringToByte(data)
    // }
    this._bodyCtrl.enqueue(data)
  }

  end() {
    console.log("deno#end:", this._closed)
    if (this._closed) {
      return
    }
    this._closed = true
    this._bodyCtrl.close()
    this._onClose(this.statusCode, this.headers)
  }
}

/**
 * 发送component UI 的样式请求
 * @param event 
 * @returns string
 */
export async function setUiHandle(event: RequestEvent) {
  const { url } = event;
  const searchParams = url.searchParams.get("data");
  // 处理GET
  if (searchParams) {
    const data = await network.asyncCallbackBuffer(
      callNative.setDWebViewUI,
      searchParams
    );
    console.log("resolveSetUiHandleData:", data)
    event.response.write(data)
    event.response.end()
    return;
  }

  const body = event.request.body;
  //   console.log(`deno#setUiHandle method:${event.request.method},
  //   body:`, body)
  // 如果没有get请求参数，又没有携带body
  if (!body) {
    console.log(`deno#setUiHandle Parameter passing cannot be empty！${body}`)
    return "Parameter passing cannot be empty！"
  }
  // console.log("deno#body 获取数据等待🚥:", event.bodyId)
  // await request_body_cache.forceGet(event.bodyId).op.promise; // 等待body的填充
  console.log("deno#body 准备获取数据📚:", event.bodyId)
  const buff = body.getReader();
  while (true) {
    const { value, done } = await buff.read();
    if (done) {
      console.log(`deno#body  传递数据结束`)
      break;
    }
    console.log(`deno#body  传递数据, body:`, value.length, ArrayBuffer.isView(value))

    const data = await network.asyncSendBufferNative(
      callNative.setDWebViewUI,
      [value]
    );
    event.response.write(data);
  }
  request_body_cache.delete(event.bodyId);
  // console.log("deno#body 删除了🏵", event.bodyId)
  event.response.end();
}

/**
 * 请求一些系统函数(扫码，手机信息)
 * @param event 
 * @returns 
 */
export async function setPollHandle(event: RequestEvent) {
  const { url } = event;
  const bufferData = url.searchParams.get("data")
  let buffer: ArrayBuffer | number[];
  // 如果是get
  if (bufferData) {
    buffer = hexToBinary(bufferData);
  } else {
    // 处理post 
    if (!event.request.body) {
      throw new Error("Parameter passing cannot be empty！");// 如果没有任何请求体
    }
    buffer = await event.request.arrayBuffer()
  }

  const stringData = bufferToString(buffer)

  /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
  const handler = JSON.parse(stringData);
  console.log("deno#setPollHandlestring Data:", stringData)

  // 看看是不是serviceWorekr准备好了
  if (getServiceWorkerReady(handler.function)) {
    return true
  }
  console.log("deno#setPollHandlestring need return?:", Object.values(callNative).includes(handler.function))
  // 在可返回的操作函数中
  if (Object.values(callNative).includes(handler.function)) {
    const result = await network.asyncCallDenoFunction(
      handler.function,
      handler.data
    );
    console.log("deno#setPollHandlestringData result: ", buffer)
    callDwebViewFactory(handler.function, result)
  }
  // 不需要返回值的调用
  network.syncSendMsgNative(handler.function, handler.data)
}


/**
 * 数据传递到DwebView
 * @param data
 * @returns
 */
function callDwebViewFactory(func: string, data: string) {
  const handler = func as keyof typeof callDVebView;
  if (handler && callDVebView[handler]) {
    handlerEvalJs(handler, callDVebView[handler], data);
  }
}

/**
 * 传递消息给DwebView-js,路径为：deno-js-(op)->rust-(ffi)->kotlin-(evaljs)->dwebView-js
 * @param wb
 * @param data
 * @returns
 */
function handlerEvalJs(handler: string, wb: string, data: string) {
  console.log("handlerEvalJs:", wb, data);
  network.syncSendMsgNative(
    callNative.evalJsRuntime,
    `javascript:document.querySelector('${wb}').dispatchStringMessage('${handler}','${data}')`
  );
}

/**
 * 看看是不是serviceworker准备好了
 * @param fun 
 * @returns 
 */
function getServiceWorkerReady(fun: string) {
  console.log(`getServiceWorkerReady: ${fun} , ${fun === callNative.serviceWorkerReady}`)
  if (fun !== callNative.serviceWorkerReady) {
    return false
  }
  // 执行事件
  for (const data of EventPollQueue) {
    openChannel(data)
  }
  callDwebViewFactory(fun, "true")
  return true
}


/**
 * 打开一个channel通道
 * @param data 
 * @returns 
 */
async function openChannel(data: IChannelConfig) {
  await network.syncSendMsgNative(callNative.evalJsRuntime,
    `navigator.serviceWorker.controller.postMessage('${JSON.stringify({ cmd: ECommand.openChannel, data })}')`)
}

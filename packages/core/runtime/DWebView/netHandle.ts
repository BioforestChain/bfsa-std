import { encoder } from "../../../util/binary.ts";
import { callKotlin } from "../../deno/android.fn.ts";
import { network } from "../../deno/network.ts";
import { contact, decoder } from '../../../util/binary.ts';
import { callNative } from "../../native/native.fn.ts";
import { callDVebView } from "../../deno/android.fn.ts";
import deno from "../../deno/deno.ts";
import { ECommand, IChannelConfig } from "@bfsx/typings";
import { EventPollQueue } from "./index.ts";


export class RequestEvent {
  constructor(readonly request: Request, readonly response: RequestResponse, readonly channelId: string) {

  }
  // @cacheGetter
  get url() {
    return new URL(this.request.url, 'https://localhost')
  }
}
export class RequestResponse {
  constructor(private _bodyCtrl: ReadableStreamController<Uint8Array>, private _onClose: (statusCode: number, headers: Record<string, string>) => void) {
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
  write(data: string | Uint8Array) {
    if (this._closed) {
      throw new Error('closed')
    }
    if (typeof data === 'string') {
      data = encoder.encode(data)
    }
    this._bodyCtrl.enqueue(data)
  }

  end() {
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
  const searchParams = url.searchParams.get("data")
  // 处理GET
  if (searchParams) {
    console.log(`bodyString${event.request.method}:`, decoder.decode(new Uint8Array(searchParams.split(",").map(v => +v))))
    const data = await network.asyncCallDenoFunction(
      callKotlin.setDWebViewUI,
      searchParams
    );
    console.log("resolveSetUiHandleData:", data)
    event.response.write(data)
    event.response.end()
    return
  }
  // 如果没有get请求参数，又没有携带body
  if (!event.request.body) {
    return "Parameter passing cannot be empty！"
  }
  // 处理POST
  const result = await readReadableStream(event.request.body)

  const data = await network.asyncCallDenoFunction(
    callKotlin.setDWebViewUI,
    result.join()
  );
  event.response.write(data)
  event.response.end()
}

/**
 * 请求一些系统函数(扫码，手机信息)
 * @param event 
 * @returns 
 */
export async function setPollHandle(event: RequestEvent) {
  const { url } = event;
  const bufferData = url.searchParams.get("data")
  let buffer = new Uint8Array()
  // 如果是get
  if (bufferData) {
    buffer = new Uint8Array(bufferData.split(",").map((value) => {
      return Number(value)
    }))
  } else {
    if (!event.request.body) {
      throw new Error("Parameter passing cannot be empty！");
    }
    buffer = await readReadableStream(event.request.body)
  }
  if (buffer.byteLength === 0) {
    throw new Error("Parameter passing cannot be empty！");
  }

  const stringData = new TextDecoder().decode(buffer)
  console.log("setPollHandlestringData:", stringData)
  /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
  const handler = JSON.parse(stringData);

  // 看看是不是serviceWorekr准备好了
  if (getServiceWorkerReady(handler.function)) {
    return true
  }
  // // 保证存在操作函数中
  if (!Object.values(callNative).includes(handler.function)) {
    return
  }
  const result = await network.asyncCallDenoFunction(
    handler.function,
    handler.data
  );
  callDwebViewFactory(handler.function, result)
}


export function readReadableStream(body: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (resolve) => {
    let result = new Uint8Array()
    const buff = body.getReader()
    while (true) {
      const { value, done } = await buff.read()
      if (done) {
        resolve(result)
        break
      }
      console.log("bodyStringValue:", value);
      result = contact(result, value)
    }
  })
}

/**
 * 数据传递到DwebView
 * @param data
 * @returns
 */
function callDwebViewFactory(func: string, data: string) {
  const handler = func as keyof typeof callDVebView;
  if (handler && callDVebView[handler]) {
    handlerEvalJs(callDVebView[handler], data);
  }
}

/**
 * 传递消息给DwebView-js,路径为：deno-js-(op)->rust-(ffi)->kotlin-(evaljs)->dwebView-js
 * @param wb
 * @param data
 * @returns
 */
function handlerEvalJs(wb: string, data: string) {
  console.log("handlerEvalJs:", wb, data);
  deno.callEvalJsStringFunction(
    callNative.evalJsRuntime,
    `"javascript:document.querySelector('${wb}').dispatchStringMessage('${data}')"`
  );
}

/**
 * 看看是不是serviceworker准备好了
 * @param fun 
 * @returns 
 */
function getServiceWorkerReady(fun: string) {
  console.log(`getServiceWorkerReady: ${fun} , ${fun === callNative.ServiceWorkerReady}`)
  if (fun !== callNative.ServiceWorkerReady) {
    false
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
  return await network.syncCallDenoFunction(callNative.evalJsRuntime,
    `navigator.serviceWorker.controller.postMessage('${JSON.stringify({ cmd: ECommand.openChannel, data })}')`)
}

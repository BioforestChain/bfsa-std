import { encoder } from "../../../util/binary.ts";
import { callKotlin } from "../../deno/android.fn.ts";
import { network } from "../../deno/network.ts";
import { contact, decoder } from '../../../util/binary.ts';
import { callNative } from "../../native/native.fn.ts";

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
  console.log(`bodyString${event.request.method}:`, searchParams)
  // 如果没有get请求参数，又没有携带body
  if (searchParams) {
    return await network.asyncCallDenoFunction(
      callKotlin.setDWebViewUI,
      searchParams
    );
  }
  if (!event.request.body) {
    return "Parameter passing cannot be empty！"
  }
  console.log("bodyString3")
  const result = await readReadableStream(event.request.body)
  console.log("bodyString6", result)
  return decoder.decode(result)
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
  /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
  const handler = JSON.parse(stringData);
  // // 保证存在操作函数中
  if (!Object.values(callNative).includes(handler.function)) {
    return
  }
  const result = await network.asyncCallDenoFunction(
    handler.function,
    handler.data
  );
  return { fun: handler.function, result }
}


export function readReadableStream(body: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (resolve) => {
    let result = new Uint8Array()
    const buff = body.getReader()
    console.log("bodyString4")
    while (true) {
      const { value, done } = await buff.read()
      console.log("bodyString5", value, done)
      if (done) {
        resolve(result)
        break
      }
      console.log("bodyStringValue:", value);
      result = contact(result, value)
    }
  })
}

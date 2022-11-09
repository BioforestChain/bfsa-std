import { encoder } from "../../../util/binary.ts";
import { callKotlin } from "../../deno/android.fn.ts";
import { network } from "../../deno/network.ts";
import { contact } from '../../../util/binary.ts';

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


export async function getEmitHandle(event: RequestEvent) {
  const { url } = event;
  console.log("requestGETurl:", url)
  if (url.pathname.endsWith("/setUi")) {
    if (!url.searchParams.get("data")) {
      event.response.write("未携带请求体！")
      event.response.end
    }
    const result = await network.asyncCallDenoFunction(
      callKotlin.setDWebViewUI,
      url.searchParams.get("data") ?? undefined
    );
    console.log("resolveNetworkHeaderRequest:", result)
    event.response.write(result)
    event.response.end()
    return
  }

}

export function postEmitHandle(request: Request) {
  let body = new Uint8Array()

  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (reoslve) => {
    if (!request.body) return body
    const responseBodyReader = request.body.getReader()
    do {
      const { value, done } = await responseBodyReader.read();
      if (done) {
        reoslve(body)
        break;
      }
      body = contact(body, value)
      console.log("requestPOSTurl:", body)
    } while (true)
  })

}

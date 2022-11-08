import { callKotlin, callDVebView } from "../../deno/android.fn.ts";
import { MetaData } from "@bfsx/metadata";
import { network } from "../../deno/network.ts";
import { loopRustChunk } from "../../deno/rust.op.ts";
import deno from "../../deno/deno.ts";
import { sleep } from "../../../util/index.ts";
import { IImportMap } from "../../../metadata/metadataType.ts";
import { EasyMap } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-map/EasyMap.ts';
import { PromiseOut } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts';
import { MapEventEmitter as EventEmitter } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/event-map_emitter/index.ts';
import { parseNetData } from "./dataGateway.ts";
import { callNative } from "../../native/native.fn.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();


class RequestEvent {
  constructor(readonly request: Request, readonly response: RequestResponse, readonly channelId: string) {

  }
  // @cacheGetter
  get url() {
    return new URL(this.request.url, 'https://localhost')
  }
}
class RequestResponse {
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


export class DWebView extends EventEmitter<{ request: [RequestEvent] }>{
  private isWaitingData = 0;
  /**反压高水位，暴露给开发者控制 */
  hightWaterMark = 20;

  entrys: string[];
  importMap: IImportMap[]
  constructor(metaData: MetaData) {
    super()
    this.entrys = metaData.manifest.enters;
    this.importMap = metaData.dwebview.importmap
    this.initAppMetaData(metaData);
    this.dwebviewToDeno(); // 挂载轮询操作， 这里会自动处理来自前端的请求，并且处理操作返回到前端

    this.on("request", async (event) => {
      const { url } = event;
      console.log("requestxxurl:", url)
      if (url.pathname.endsWith("/setUi")) {
        console.log("searchParams:", url.searchParams.get("data"))
        const result = await network.asyncCallDenoFunction(
          callKotlin.setDWebViewUI,
          url.searchParams.get("data") ?? ''
        );
        console.log("resolveNetworkHeaderRequest:", result)
        event.response.write(result)
        event.response.end()
        return
      }

      // 是不是资源文件 （index.html,xxx.js）
      const isAssetsFile = url.pathname.lastIndexOf(".") !== -1
      // 如果是需要转发的数据请求 pathname: "/getBlockInfo"
      if (!isAssetsFile) {
        const data = await parseNetData(event.request, url.pathname, this.importMap)
        event.response.write(data)
        console.log("映射返回:", data)
        event.response.end()
        return
      }
    })
  }

  /**
 * 轮询向rust拿数据，路径为：dwebView-js-(fetch)->kotlin-(ffi)->rust-(op)->deno-js->kotlin(eventJs)->dwebView-js
 * 这里是接收dwebView-js操作系统API转发到后端的请求
 */
  async dwebviewToDeno() {
    do {
      const data = await loopRustChunk().next();
      await sleep(10)
      if (data.done) {
        continue
      }
      this.isWaitingData++; // 增加一个事件等待数
      console.log("dwebviewToDeno====>", data.value);
      await this.chunkGateway(data.value)
      /// 这里是重点，使用 do-while ，替代 finally，可以避免堆栈溢出。
    } while (true);
  }

  /**
   * 解析网络请求
   * @param strBits 
   */
  async chunkGateway(strBits: Uint8Array) {
    const strPath = decoder.decode(new Uint8Array(strBits));
    console.log("strPath :", strPath)
    if (strPath.startsWith("/channel")) {  // /channel/349512662458373/chunk=0002,104,116,116,112,115,58,1
      // 拿到channelId
      const channelId = strPath.substring(
        strPath.lastIndexOf("/channel/") + 9, strPath.lastIndexOf("/chunk")
      );
      const stringHex = strPath.substring(strPath.lastIndexOf("=") + 1);
      console.log("stringHex:", stringHex)
      const buffers = stringHex.split(",").map(v => Number(v))
      const chunk = (new Uint8Array(buffers))

      await this.chunkHanlder(channelId, chunk)
    }
  }


  private _request_body_cache = EasyMap.from({
    creater(_boydId: number) {
      let bodyStreamController: ReadableStreamController<ArrayBuffer>
      const bodyStream = new ReadableStream({ start(controller) { bodyStreamController = controller } })
      return {
        bodyStream,
        bodyStreamController: bodyStreamController!
      }
    }
  })

  /**
   * 处理chunk
   * @param channelId 
   * @param chunk 
   */
  async chunkHanlder(channelId: string, chunk: Uint8Array) {
    // 拿到头部
    const headers_body_id = new Uint16Array(chunk.subarray(0, 2))[0]
    // 是否结束
    const isEnd = chunk.slice(-1)[0] === 1// 1为发送结束，0为还没结束
    console.log(`parseChunkBinary headerId:${headers_body_id},isEnd:${isEnd}`)

    const contentBytes = chunk.slice(2, -1);
    // 如果是headers请求
    if (headers_body_id % 2 === 0) {
      const headersId = headers_body_id;
      console.log("constentString:", decoder.decode(contentBytes))
      const { url, headers, method } = JSON.parse(decoder.decode(contentBytes));
      let req: Request;
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        const body = this._request_body_cache.forceGet(headersId + 1);
        req = new Request(url, { method, headers, body: body.bodyStream });
      } else {
        req = new Request(url, { method, headers });
      }

      let responseBodyCtrl!: ReadableStreamController<Uint8Array>
      const responseBody = new ReadableStream<Uint8Array>({ start: (ctrl) => responseBodyCtrl = ctrl });
      // create request head
      const event = new RequestEvent(req, new RequestResponse(responseBodyCtrl, async (statusCode, headers) => {
        await postBodyDone.resolve();
        this.callSWPostMessage({
          returnId: headersId,
          channelId: channelId,
          chunk: encoder.encode(JSON.stringify({ statusCode, headers })).join(",") + ",1"
        });
      }), channelId);
      this.emit("request", event);
      const postBodyDone = new PromiseOut<void>()
      const responseBodyReader = responseBody.getReader()
      do {
        const { value: chunk, done } = await responseBodyReader.read();
        if (done) {
          break
        }
        this.callSWPostMessage({
          returnId: headersId + 1,
          channelId: channelId,
          chunk: chunk!.join(",") + ",0"
        });

      } while (true)
      postBodyDone.resolve()
    }
  }


  // /**
  //  * 解析网络请求
  //  * @param chunk 
  //  */
  // async parseChunkBinary(chunk: Uint8Array) {

  //   // 主体内容
  //   const hexBody = chunk.slice(1, chunk.length - 1)
  //   // headerId偶数为请求头
  //   const stringBody = new TextDecoder().decode(new Uint8Array(hexBody));
  //   // 解析出真正的请求
  //   const stringArray = stringBody.split("|", 2)
  //   console.log("stringArray:", stringArray)
  //   const stringData = stringArray[0]
  //   const headers = stringArray[1]
  //   // 拿到真正的请求消息
  //   const stringPath = new URL(stringData).pathname
  //   console.log("stringPath:", stringPath)
  //   // 资源文件不处理
  //   if (stringPath.lastIndexOf(".") !== -1) {
  //     return
  //   }
  //   // 如果不存在请求体
  //   if (stringPath.lastIndexOf("=") == -1) {
  //     parseNetData(stringPath, this.importMap)
  //     return
  //   }
  //   // 表示为get请求,携带了param参数
  //   if (headers_body_id % 2 == 0) {
  //     await this.resolveNetworkHeaderRequest(stringPath, headers, headers_body_id)
  //     return
  //   }
  //   // 分发body数据
  //   this.resolveNetworkBodyRequest(stringPath, Boolean(isEnd))
  // }

  // /**
  //  * 分发头部请求网络请求
  //  * @param path 
  //  * @param headers 
  //  */
  // async resolveNetworkHeaderRequest(path: string, headers: string, status = 200, statusText = "success") {
  //   const bufferData = path.substring(path.lastIndexOf("=") + 1)

  //   if (path.startsWith("/setUi")) {
  //     const result = await network.asyncCallDenoFunction(
  //       callKotlin.setDWebViewUI,
  //       bufferData
  //     );
  //     console.log("resolveNetworkHeaderRequest:", result)
  //     this.callSWPostMessage({ result: JSON.stringify(result), headersId: string, channelId: this.channelId, headers, status, statusText })
  //     return
  //   }

  //   if (path.startsWith("/poll")) {
  //     const buffer = bufferData.split(",").map((value) => {
  //       return Number(value)
  //     });
  //     const stringData = new TextDecoder().decode(new Uint8Array(buffer))
  //     /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
  //     const handler = JSON.parse(stringData);
  //     // // 保证存在操作函数中
  //     if (!Object.values(callNative).includes(handler.function)) {
  //       return
  //     }
  //     const result = await network.asyncCallDenoFunction(
  //       handler.function,
  //       handler.data
  //     );
  //     this.callDwebViewFactory(handler.function, result)
  //     return
  //   }
  // }

  /**
   * 分发body数据
   * @param path  数据
   * @param isEnd  如果是true就是消息结束了，如果是false 就是消息未结束
   */
  resolveNetworkBodyRequest(path: string, isEnd: boolean) {
    console.log("resolveNetworkBodyRequest:", path, isEnd)
  }

  /**
  * 发送消息给serviceWorker message
  * @param hexResult 
  */
  // deno-lint-ignore ban-types
  callSWPostMessage(result: object) {
    this.isWaitingData--; // 完成闭环，减少一个等待数
    network.syncCallDenoFunction(callNative.evalJsRuntime,
      `navigator.serviceWorker.controller.postMessage('${JSON.stringify(result)}')`);
  }

  /**
   * 数据传递到DwebView
   * @param data
   * @returns
   */
  callDwebViewFactory(func: string, data: string) {
    const handler = func as keyof typeof callDVebView;
    if (handler && callDVebView[handler]) {
      this.handlerEvalJs(callDVebView[handler], data);
    }
    if (this.isWaitingData === 0) return;
    this.isWaitingData--; // 完成闭环，减少一个等待数
  }

  /**
   * 传递消息给DwebView-js,路径为：deno-js-(op)->rust-(ffi)->kotlin-(evaljs)->dwebView-js
   * @param wb
   * @param data
   * @returns
   */
  handlerEvalJs(wb: string, data: string) {
    console.log("handlerEvalJs:", this.isWaitingData, wb, data);
    deno.callEvalJsStringFunction(
      callNative.evalJsRuntime,
      `"javascript:document.querySelector('${wb}').dispatchStringMessage('${data}')"`
    );
  }
  /**
  * 初始化app元数据
  * @param metaData  元数据
  * @returns void
  */
  initAppMetaData(metaData: MetaData) {
    if (Object.keys(metaData).length === 0) return;
    network.syncCallDenoFunction(
      callNative.initMetaData,
      metaData
    );
  }

  /**
   * 激活DwebView
   * @param entry // DwebView入口
   */
  activity(entry: string) {
    // 判断在不在入口文件内
    if (this.entrys.toString().match(RegExp(`${entry}`))) {
      network.syncCallDenoFunction(callNative.openDWebView, entry);
      return;
    }
    throw new Error("您传递的入口不在配置的入口内，需要在配置文件里配置入口");
  }
}

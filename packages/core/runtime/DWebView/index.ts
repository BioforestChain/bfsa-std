import { MetaData } from "@bfsx/metadata";
import { network } from "../../deno/network.ts";
import { getRustChunk } from "../../deno/rust.op.ts";
import { decoder, encoder } from "../../../util/index.ts";
import { IImportMap } from "../../../metadata/metadataType.ts";
import { EasyMap } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-map/EasyMap.ts';
import { PromiseOut } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts';
import { MapEventEmitter as EventEmitter } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/event-map_emitter/index.ts';
import { callNative } from "../../native/native.fn.ts";
import { RequestEvent, RequestResponse, setPollHandle, setUiHandle } from "./netHandle.ts";
import { parseNetData } from "./dataGateway.ts";
import { ECommand, EChannelMode, IChannelConfig } from "@bfsx/typings";

export class DWebView extends EventEmitter<{ request: [RequestEvent] }>{
  entrys: string[];
  importMap: IImportMap[]
  constructor(metaData: MetaData) {
    super()
    this.entrys = metaData.manifest.enters;
    this.importMap = metaData.dwebview.importmap
    this.initAppMetaData(metaData);
    this.dwebviewToDeno(); // 挂载轮询操作， 这里会自动处理来自前端的请求，并且处理操作返回到前端

    this.on("request", (event) => {
      try {
        const { url } = event;
        // 是不是资源文件 （index.html,xxx.js）
        const isAssetsFile = url.pathname.lastIndexOf(".") !== -1
        // 填充response headers
        event.request.headers.forEach((val, key) => {
          event.response.setHeaders(key, val)
        })
        console.log(`request${event.request.method}:${event.channelId}`, url)

        if (url.pathname.endsWith("/setUi")) {
          setUiHandle(event)
          return
        }
        if (url.pathname.startsWith("/poll")) {
          event.response.write("ok") // 操作成功
          event.response.end()
          setPollHandle(event)
          return
        }
        // 如果是需要转发的数据请求 pathname: "/getBlockInfo"
        if (!isAssetsFile) {
          parseNetData(event, url.pathname, this.importMap)
          return
        }
      } catch (error) {
        console.error("request", error)
      }
    })
  }

  /**
 * 轮询向rust拿数据，路径为：dwebView-js-(fetch)->kotlin-(ffi)->rust-(op)->deno-js->kotlin(eventJs)->dwebView-js
 * 这里是接收dwebView-js操作系统API转发到后端的请求
 */
  async dwebviewToDeno() {
    do {
      const data = await getRustChunk();
      if (data.done) {
        continue
      }
      console.log("dwebviewToDeno====>", data.value);
      this.chunkGateway(data.value)
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
      const buffers = stringHex.split(",").map(v => Number(v))
      const chunk = (new Uint8Array(buffers))

      await this.chunkHanlder(channelId, chunk)
    }
  }


  private _request_body_cache = EasyMap.from({
    // deno-lint-ignore no-unused-vars
    creater(boydId: number) {
      let bodyStreamController: ReadableStreamController<Uint8Array>
      const bodyStream = new ReadableStream<Uint8Array>({ start(controller) { bodyStreamController = controller } })
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
      const body = this._request_body_cache.forceGet(headersId + 1); // 获取body
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
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
      // 等待真正的请求回来
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
      return
    }
    try {
      // await sleep(1000)
      const body_id = headers_body_id;
      // 如果是body 需要填充Request body
      const body = this._request_body_cache.forceGet(body_id); // 获取body
      console.log("推入body:", channelId, headers_body_id, isEnd, contentBytes)
      // body 流结束
      if (isEnd) {
        body.bodyStreamController.close()
        return
      }
      body.bodyStreamController.enqueue(contentBytes)
    } catch (error) {
      console.error("bodyStreamController:", error);

    }

  }
  /**
   * 分发body数据
   * @param path  数据
   * @param isEnd  如果是true就是消息结束了，如果是false 就是消息未结束
   */
  resolveNetworkBodyRequest(path: string, isEnd: boolean) {
    console.log("resolveNetworkBodyRequest:", path, isEnd)
  }
  /**
   * 打开请求通道
   * @param url  api/user/*, api/:method,api/chunkInfo
   * @param mode  pattern | static
   */
  async openRequest(url: string, mode: EChannelMode) {
    await this.openChannel({ url, mode })
  }

  /**
   * 打开一个channel通道
   * @param data 
   * @returns 
   */
  async openChannel(data: IChannelConfig) {
    return await network.asyncCallDenoFunction(callNative.evalJsRuntime,
      `navigator.serviceWorker.controller.postMessage('${JSON.stringify({ cmd: ECommand.openChannel, data })}')`)
  }

  /**
  * 发送消息给serviceWorker message
  * @param hexResult 
  */
  // deno-lint-ignore ban-types
  callSWPostMessage(result: object) {
    network.syncCallDenoFunction(callNative.evalJsRuntime,
      `navigator.serviceWorker.controller.postMessage('${JSON.stringify(result)}')`);
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

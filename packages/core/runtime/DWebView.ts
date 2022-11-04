import { callDeno, callKotlin, callDVebView } from "../deno/android.fn.ts";
import { MetaData } from "@bfsx/metadata";
import { network } from "../deno/network.ts";
import { loopRustChunk } from "../deno/rust.op.ts";
import deno from "../deno/deno.ts";
import { sleep } from "../../util/index.ts";
export class DWebView {
  private isWaitingData = 0;
  /**反压高水位，暴露给开发者控制 */
  hightWaterMark = 20;

  entrys: string[];
  // deno-lint-ignore no-inferrable-types
  channelId: string = "";
  constructor(metaData: MetaData) {
    this.entrys = metaData.manifest.enters;
    this.initAppMetaData(metaData);
    this.dwebviewToDeno(); // 挂载轮询操作， 这里会自动处理来自前端的请求，并且处理操作返回到前端
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
      await this.gateway(data.value)
      /// 这里是重点，使用 do-while ，替代 finally，可以避免堆栈溢出。
    } while (true);
  }

  /**
   * 解析网络请求
   * @param strBits 
   */
  async gateway(strBits: Uint8Array) {
    const strChunkPath = new TextDecoder().decode(new Uint8Array(strBits)); // /channel/349512662458373/chunk=0002,104,116,116,112,115,58,1
    // 拿到channelID
    this.channelId = strChunkPath.substring(
      strChunkPath.lastIndexOf("/channel/") + 9, strChunkPath.lastIndexOf("/chunk")
    )
    console.log("strChunkPath :", strChunkPath)
    const stringHex = strChunkPath.substring(strChunkPath.lastIndexOf("=") + 1);
    console.log("stringHex:", stringHex)
    const buffers = stringHex.split(",").map(v => Number(v))
    await this.parseChunkBinary(new Uint8Array(buffers))
  }

  /**
   * 解析网络请求
   * @param strBits 
   */
  async parseChunkBinary(strBits: Uint8Array) {
    // 拿到头部
    const headerId = strBits[0]
    // 是否结束
    const isEnd = strBits.slice(strBits.length - 1, strBits.length)// 1为发送结束，0为还没结束
    console.log(`parseChunkBinary headerId:${headerId},isEnd:${isEnd}`)
    // 主体内容
    const hexBody = strBits.slice(1, strBits.length - 1)
    // headerId偶数为请求头
    const stringBody = new TextDecoder().decode(new Uint8Array(hexBody));
    // 解析出真正的请求
    const stringArray = stringBody.split("|", 2)
    console.log("stringArray:", stringArray)
    const stringData = stringArray[0]
    const headers = stringArray[1]
    // 拿到真正的请求消息
    const stringPath = stringData.substring(stringData.lastIndexOf("/"))
    // 如果不存在请求体
    if (stringPath.lastIndexOf("=") == -1) {
      return
    }
    // 表示为get请求,携带了param参数
    if (headerId % 2 == 0) {
      await this.resolveNetworkHeaderRequest(stringPath, headers)
      return
    }
    // 分发body数据
    this.resolveNetworkBodyRequest(stringPath, Boolean(isEnd))
  }

  /**
   * 分发头部请求网络请求
   * @param path 
   * @param headers 
   */
  async resolveNetworkHeaderRequest(path: string, headers: string, status = 200, statusText = "success") {
    const bufferData = path.substring(path.lastIndexOf("=") + 1)

    if (path.startsWith("/setUi")) {
      const result = await network.asyncCallDenoFunction(
        callKotlin.setDWebViewUI,
        bufferData
      );
      console.log("resolveNetworkHeaderRequest:", result)
      this.callSWPostMessage({ result: JSON.stringify(result), channelId: this.channelId, headers, status, statusText })
      return
    }

    if (path.startsWith("/poll")) {
      const buffer = bufferData.split(",").map((value) => {
        return Number(value)
      });
      const stringData = new TextDecoder().decode(new Uint8Array(buffer))
      /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
      const handler = JSON.parse(stringData);
      // // 保证存在操作函数中
      if (!Object.values(callDeno).includes(handler.function)) {
        return
      }
      const result = await network.asyncCallDenoFunction(
        handler.function,
        handler.data
      );
      this.callDwebViewFactory(handler.function, result)
      return
    }
  }

  /**
   * 分发body数据
   * @param path  数据
   * @param isEnd  如果是true就是消息结束了，如果是false 就是消息未结束
   */
  resolveNetworkBodyRequest(path: string, isEnd: boolean) {

  }

  /**
  * 传递消息给serviceWorker
  * @param hexResult 
  */
  callSWPostMessage(result: { result: string, channelId: string, headers: string, status: number, statusText: string }) {
    this.isWaitingData--; // 完成闭环，减少一个等待数
    network.syncCallDenoFunction(callKotlin.callSWMessage, result)
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
      callDeno.evalJsRuntime,
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
      callDeno.initMetaData,
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
      network.syncCallDenoFunction(callDeno.openDWebView, entry);
      return;
    }
    throw new Error("您传递的入口不在配置的入口内，需要在配置文件里配置入口");
  }
}

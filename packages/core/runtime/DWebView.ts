import { callDeno, callDVebView } from "../deno/android.fn.ts";
import { MetaData } from "@bfsx/metadata";
import { network } from "../deno/network.ts";
import { loopRustString } from "../deno/rust.op.ts";
import deno from "../deno/deno.ts";
import { sleep } from "../../util/index.ts";

export class DWebView {
  private isWaitingData = 0;
  /**反压高水位，暴露给开发者控制 */
  hightWaterMark = 10;

  entrys: string[];
  constructor(metaData: MetaData) {
    this.entrys = metaData.manifest.enters;
    this.initAppMetaData(metaData);
    this.dwebviewToDeno(); // 挂载轮询操作， 这里会自动处理来自前端的请求，并且处理操作返回到前端
  }

  gateway(strBits: string) {
    // 拿到头部
    const headerId = strBits.substring(0, strBits.indexOf(":"))
    // 主体内容
    const hexBody = strBits.substring(strBits.indexOf(":") + 1)
    console.log("hexBody:", hexBody)
    const hexArrBody = String(hexBody).split(",") as unknown as ArrayBuffer
    // headerId偶数为请求头
    const stringBody = new TextDecoder().decode(new Uint8Array(hexArrBody));
    console.log("stringBody:", stringBody)
    // 解析出真正的请求
    const stringArray = stringBody.split("|", 2)
    console.log("stringArray:", stringArray)
    const stringData = stringArray[0]
    const headers = stringArray[1]
    // 拿到真正的请求消息
    const stringPath = stringData.substring(stringData.lastIndexOf("/"))
    console.log(`parseChunkBinary headerId:${headerId},${stringPath}`)
    // 表示为get请求,携带了param参数
    // 分发请求
    // resolveNetworkRequest(request, stringPath, header, channelId)
  }

  /**
 * 轮询向rust拿数据，路径为：dwebView-js-(fetch)->kotlin-(ffi)->rust-(op)->deno-js->kotlin(eventJs)->dwebView-js
 * 这里是接收dwebView-js操作系统API转发到后端的请求
 */
  async dwebviewToDeno() {
    do {
      const data = await loopRustString("op_rust_to_js_buffer").next();
      await sleep(10)
      if (data.done) {
        continue
      }
      console.log("dwebviewToDeno====>", data.value);
      this.gateway(data.value)
      /// 如果是操作对象，拿出对象的操作函数和数据,传递给Kotlin
      // const handler = JSON.parse(data.value);
      // // 保证存在操作函数中
      // if (Object.values(callDeno).includes(handler.function)) {
      //   await this.callKotlinFactory(handler);
      //   continue;
      // }
      /// 这里是重点，使用 do-while ，替代 finally，可以避免堆栈溢出。
    } while (true);
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
      `'${JSON.stringify(metaData)}'`
    );
  }

  /**
   * 激活DwebView
   * @param entry // DwebView入口
   */
  activity(entry: string) {
    // 判断在不在入口文件内
    if (this.entrys.toString().match(RegExp(`${entry}`))) {
      network.syncCallDenoFunction(callDeno.openDWebView, `"${entry}"`);
      return;
    }
    throw new Error("您传递的入口不在配置的入口内，需要在配置文件里配置入口");
  }

  /**
 * 操作传递到kotlin
 * @param handler
 * @returns
 */
  async callKotlinFactory(handler: { function: string; data: string }) {
    // 等待数超过最高水位，操作全部丢弃
    if (this.isWaitingData > this.hightWaterMark) return;
    const result = await network.asyncCallDenoFunction(
      handler.function,
      handler.data
    );
    this.callDwebViewFactory(handler.function, result);
    this.isWaitingData++; // 增加一个等待数
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
}

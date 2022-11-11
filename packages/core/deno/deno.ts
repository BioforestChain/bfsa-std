/////////////////////////////
/// 这里封装调用deno的方法，然后暴露出去
/////////////////////////////

import { eval_js, js_to_rust_buffer } from "./rust.op.ts";
import { isAndroid } from "../runtime/device.ts";

const versionView = new Uint8Array(new ArrayBuffer(1));
const headView = new Uint8Array(new ArrayBuffer(2)); // 初始化头部标记
versionView[0] = 0x01; // 版本号都是1，表示消息
class Deno {
  constructor() {
    this.bitLeftShifts();
  }

  /**
   * 加一，用来发消息定位
   */
  bitLeftShifts() {
    headView[0] += 1;
  }

  /**
   * 调用deno的函数
   * @param handleFn
   * @param data
   */
  callFunction(handleFn: string, data = "''") {
    const uint8Array = this.structureBinary(handleFn, data);
    const msg = new Uint8Array();
    if (isAndroid) {
      js_to_rust_buffer(uint8Array); // android - denoOp
    } else {
      // msg = await netCallNativeService(handleFn, data); //  ios - javascriptCore
    }
    return { versionView, headView, msg };
  }
  /**
   * 调用evaljs 执行js
   * @param handleFn
   * @param data
   */
  callEvalJsStringFunction(handleFn: string, data = "''") {
    const uint8Array = this.structureBinary(handleFn, data);
    if (isAndroid) {
      eval_js(uint8Array); // android - denoOp
    } else {
      // netCallNativeService(handleFn, data); //  ios - javascriptCore
    }
  }

  /** 针对64位
   * 第一块分区：版本号 2^8 8位，一个字节 1：表示消息，2：表示广播，4：心跳检测
   * 第二块分区：头部标记 2^16 16位 两个字节  根据版本号这里各有不同，假如是消息，就是0，1；如果是广播则是组
   * 第三块分区：数据主体 动态创建
   */
  structureBinary(fn: string, data: string | Uint8Array = "") {
    this.bitLeftShifts()
    const message = `{"function":"${fn}","data":${data}}`;

    // 字符 转 Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);

    return this.concatenate(versionView, headView, uint8Array);
  }

  /**
   * 拼接Uint8Array
   * @param arrays Uint8Array[]
   * @returns Uint8Array
   */
  concatenate(...arrays: Uint8Array[]) {
    let totalLength = 0;
    for (const arr of arrays) {
      totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
}

export default new Deno();

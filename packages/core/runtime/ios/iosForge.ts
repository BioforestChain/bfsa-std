import { bufferToString, hexToBinary } from "../../../util/binary.ts";
import { network } from "../../deno/network.ts";
import { callNative } from "../../native/native.fn.ts";
import { basePollHandle } from "../DWebView/netHandle.ts";

/**
 * 处理ios请求
 * @param url 
 * @param buffer 
 */
export async function iosRequestFanctory(url: URL, buffer?: string) {
  const pathname = url.pathname;
  // console.log("deno#iosRequestFanctory:", pathname)
  if (pathname.endsWith("/setUi")) {
    return setIosUiHandle(url, buffer) // 处理 system ui
  }
  if (pathname.startsWith("/poll")) {
    await setIosPollHandle(url, buffer) // 处理真正的请求
  }

}

/**
 * ios ui相关操作
 * @param url 
 * @returns 
 */
async function setIosUiHandle(url: URL, hexBuffer?: string) {
  const searchParams = url.searchParams.get("data");
  console.log("deno#setIosUiHandle:", searchParams, hexBuffer)
  if (searchParams) {
    const data = await network.asyncCallbackBuffer(
      callNative.setDWebViewUI,
      searchParams
    );
    return data
  }
  if (!hexBuffer) {
    console.error("Parameter passing cannot be empty！");// 如果没有任何请求体
    throw new Error("Parameter passing cannot be empty！")
  }
  const data = await network.asyncSendBufferNative(
    callNative.setDWebViewUI,
    [new Uint8Array(hexToBinary(hexBuffer))]
  );
  return data
}

/**
 * ios 系统api逻辑相关操作
 * @param url 
 * @param hexBuffer 
 */
function setIosPollHandle(url: URL, hexBuffer?: string) {
  const bufferData = url.searchParams.get("data")
  console.log("deno#setIosPollHandle:", bufferData, hexBuffer);
  let buffer: ArrayBuffer | number[];
  // 如果是get
  if (bufferData) {
    buffer = hexToBinary(bufferData);
  }
  // 处理post 
  if (!hexBuffer) {
    console.error("Parameter passing cannot be empty！");
    throw new Error("Parameter passing cannot be empty！");// 如果没有任何请求体
  }
  buffer = hexToBinary(hexBuffer)

  const stringData = bufferToString(buffer);
  const handler = JSON.parse(stringData);
  console.log("deno#setIosPollHandle Data:", stringData)
  basePollHandle(handler.function, handler.data)
}



// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />
import { TNative } from "@bfsx/typings";
import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts";
import { _encoder } from "../../util/binary.ts";
import { isIos } from "../common/index.ts";
import { NativeHandle } from "../common/nativeHandle.ts";
import { iosListen } from "./iosListen.ts";
const _serviceWorkerIsRead = new PromiseOut<void>();


/**
 * 注册serverWorker方法
 */
export function registerServiceWorker() {
  addEventListener("load", () => {
    // 能力检测
    if ("serviceWorker" in navigator && isIos() === false) {
      console.log("是否是ios环境：", isIos())

      navigator.serviceWorker
        .register("serviceWorker.js", { scope: "/", type: "module" })
        .then(() => {
          _serviceWorkerIsRead.resolve()
          // 通知serviceWorker已经准备好了
          serviceWorkerReady()
          console.log("Service Worker register success 🤩");
        })
        .catch((e) => {
          console.log("Service Worker register error 🤯", e.message);
        });

    } else {
      console.log("没有serviceWorker 🥕")
      _serviceWorkerIsRead.resolve(); // 没有serviceWorker为ios环境，直接放行
    }
  });
}

/**通知deno-js后端serviceworker 已经准备好了 */
export async function serviceWorkerReady() {
  const message = `{"function":"${NativeHandle.ServiceWorkerReady}","data":""}`;
  const buffer = _encoder.encode(message);
  const response = await fetch(`/poll?data=${buffer}`, {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "*", // 客户端开放，不然会报cors
    },
    mode: "cors",
  });
  const data = await response.text();
  if (data.startsWith("<!DOCTYPE")) {
    return false
  }
  console.log("plugin#serviceWorkerReady: ", data);
  return data
}

/**
 * 创建消息发送请求给 Kotlin 转发 dwebView-to-deno
 * @param fun 操作函数
 * @param data 数据
 * @returns Promise<Ok>
 */
export function createMessage(
  fun: string,
  data: TNative = ""
): Promise<string> {
  if (data instanceof Object) {
    data = JSON.stringify(data); // stringify 两次转义一下双引号
  }
  const message = `{"function":"${fun}","data":${JSON.stringify(data)}}`;
  const buffer = _encoder.encode(message);
  if (isIos()) {
    return iosListen.eventIosGetPoll(`/poll?data=${buffer}`)
  }
  return getConnectChannel(`/poll?data=${buffer}`);
}

/**
 *  发送请求到netive设置ui
 * @param url
 * @returns
 */
export function getCallNative(fun: string, data: TNative = ""): Promise<any> {
  if (data instanceof Object) {
    data = JSON.stringify(data); // stringify 两次转义一下双引号
  }
  const message = `{"function":"${fun}","data":${JSON.stringify(data)}}`;
  console.log("getCallNative message");
  console.log(message);
  // console.log("plugin#getCallNative:", message);
  const buffer = _encoder.encode(message);
  if (isIos()) {
    return iosListen.eventIosGetSetUi(fun, `/setUi?data=${buffer}`)
  }
  return getConnectChannel(`/setUi?data=${buffer}`);
}

/**
 *  发送请求到netive设置ui
 * @param url
 * @returns
 */
export async function postCallNative(
  fun: string,
  data: TNative = ""
): Promise<any> {
  if (data instanceof Object) {
    data = JSON.stringify(data); // stringify 两次转义一下双引号
  }
  const message = `{"function":"${fun}","data":${JSON.stringify(data)}}`;
  const buffer = _encoder.encode(message);
  if (isIos()) {
    return await iosListen.eventIosPostChannel(fun, "/setUi", new Blob([buffer]))
  }
  // console.log("🍙plugin#postCallNative1:",message)
  return postConnectChannel("/setUi", buffer);
}

/**
 * 请求kotlin 代理转发 GET
 * @param url
 * @returns 直接返回ok
 */

export async function getConnectChannel(url: string) {
  // 等待serviceWorker准备好
  await _serviceWorkerIsRead.promise;

  const response = await fetch(url, {
    method: "GET", // dwebview 无法获取post的body
    headers: {
      "Access-Control-Allow-Origin": "*", // 客户端开放，不然会报cors
    },
    mode: "cors",
  });
  const data = await response.text()
  if (data.startsWith("<!DOCTYPE")) {
    return ""
  }
  console.log("plugin#getConnectChannel:", data);
  return data
}

/**
 * 请求kotlin 代理转发 POST
 * @param url
 * @returns 直接返回ok
 */

export async function postConnectChannel(url: string, body: Uint8Array) {
  // 等待serviceWorker准备好
  await _serviceWorkerIsRead.promise;

  const response = await fetch(url, {
    method: "POST", // dwebview 无法获取post的body,曲线救国，发送到serverWorker去处理成数据片。
    headers: {
      "Access-Control-Allow-Origin": "*", // 客户端开放，不然会报cors
    },
    mode: "cors",
    body: new Blob([body.buffer]),
  });
  const data = await response.text();
  return data;
}



// deno-lint-ignore-file no-explicit-any
/// <reference lib="dom" />
import { TNative } from "@bfsx/typings";
import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts";
import { isIos, _encoder } from "../common/index.ts";
import { NativeHandle } from "../common/nativeHandle.ts";
const _serviceWorkerIsRead = new PromiseOut<void>();


/**
 * 注册serverWorker方法
 */
export function registerServiceWorker() {
  addEventListener("load", () => {
    // 能力检测
    if ("serviceWorker" in navigator) {
      console.log("是否是ios环境：", isIos())
      if (isIos()) {
        // 注册ios serviceWorker监听事件
        eventIosMessageChannel(navigator)
      }

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
  // console.log("plugin#getCallNative:", message);
  const buffer = _encoder.encode(message);
  return getConnectChannel(`/setUi?data=${buffer}`);
}

/**
 *  发送请求到netive设置ui
 * @param url
 * @returns
 */
export function postCallNative(
  fun: string,
  data: TNative = ""
): Promise<any> {
  if (data instanceof Object) {
    data = JSON.stringify(data); // stringify 两次转义一下双引号
  }
  const message = `{"function":"${fun}","data":${JSON.stringify(data)}}`;
  const buffer = _encoder.encode(message);
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

/**
 * 处理ios事件转发
 * @param navigator 
 */
function eventIosMessageChannel(navigator: Navigator) {
  const messageChannel = new MessageChannel();
  messageChannel.port1.onmessage = function (event) {
    if (event.data.error) {
      console.error("messageChannel: ", event.data.error);
    } else {
      console.log("iosEmit", event.data);
      // dnt-shim-ignore
      (window as any).getConnectChannel(event.data);
    }
  };

  if (!navigator.serviceWorker.controller) {
    console.log("controller is still none for some reason.");
    return;
  }
  console.log("打开一个message channel", isIos());
  // 创建消息通道
  navigator.serviceWorker.controller.postMessage(`{"cmd":"openMessageChannel","data":${isIos}}`, [messageChannel.port2]);

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log("plugin#eventIosMessageChannel response:", event.data.url);
  });
}


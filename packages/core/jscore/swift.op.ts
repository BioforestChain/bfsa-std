import jscore from "../jscore/jscore.ts";
import { callNative } from "../native/native.fn.ts";

/**
 * 发送系统通知
 * @param data
 */
export function sendJsCoreNotification(data: string) {
  return jscore.callJavaScriptWithFunctionNameParam(callNative.sendNotification, data);
}

export function netCallNativeService(fn: string, data: string | Uint8Array = "") {
  return jscore.callJavaScriptWithFunctionNameParam(fn, data);
}

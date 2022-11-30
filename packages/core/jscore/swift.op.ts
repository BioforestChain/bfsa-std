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
  const uint8 = jscore.callJavaScriptWithFunctionNameParam(fn, data);
  if (!uint8) return new Uint8Array(0);
  console.log("netCallNativeService:==>", uint8)
  return uint8
}

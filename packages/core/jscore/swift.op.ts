import jscore from "../jscore/jscore.ts";
import { callNative } from "../native/native.fn.ts";
import { TNative } from '@bfsx/typings';

/**
 * 发送系统通知
 * @param data
 */
export function sendJsCoreNotification(data: string) {
  return jscore.callJavaScriptWithFunctionNameParam(callNative.sendNotification, data);
}

export  function netCallNativeService(fn: string, data: TNative = "") {
  console.log("🥳deno#netCallNativeService:",fn,data)
  const uint8 =  jscore.callJavaScriptWithFunctionNameParam(fn, data);
  if (!uint8) return new Uint8Array(0);
  console.log("netCallNativeService:==>",fn, uint8)
  return uint8
}

import jscore from "../jscore/jscore.ts";
import { callNative } from "../native/native.fn.ts";

/**
 * 发送系统通知
 * @param data
 */
export function sendJsCoreNotification(data: string) {
  jscore.callJavaScriptWithFunctionNameParam(callNative.sendNotification, data);
}

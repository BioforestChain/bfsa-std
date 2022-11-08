import { callNative } from "../native/native.fn.ts";
import { setNotification } from "../deno/rust.op.ts";
import { sendJsCoreNotification } from "../jscore/swift.op.ts";
import { isAndroid } from "./device.ts";
import { network } from "../deno/network.ts";

/**
 * 发送通知
 * @param data
 * @returns
 */
export async function sendNotification(data: INotification) {
  // 如果是android需要在这里拿到app_id，如果是ios,会在ios端拼接
  if (data.app_id === undefined && isAndroid) {
    const app_id = await network.asyncCallDenoFunction(callNative.getBfsAppId);
    data = Object.assign(data, { app_id: app_id });
  }
  const message = JSON.stringify(data);
  const buffer = new TextEncoder().encode(message);
  if (isAndroid) {
    return setNotification(buffer);
  }
  return sendJsCoreNotification(message);
}

export interface INotification {
  title: string; // 消息标题
  body: string; // 消息主体
  app_id?: string; // appId 表示消息需要传递到哪里
  priority: number; // 消息优先级
}

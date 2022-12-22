import { callNative } from "../native/native.fn.ts";
import { setNotification } from "../deno/rust.op.ts";
import { sendJsCoreNotification } from "../jscore/swift.op.ts";
import { network } from "../deno/network.ts";
import { currentPlatform, EPlatform } from "./platform.ts";
import { stringToByte } from "../../util/binary.ts";

/**
 * 发送通知
 * @param data
 * @returns
 */
export async function sendNotification(data: INotification) {
  // 如果是android需要在这里拿到app_id，如果是ios,会在ios端拼接
  if (data.app_id == undefined && currentPlatform() === EPlatform.android) {
    const app_id = await network.asyncCallDenoFunction(callNative.getBfsAppId);
    data = Object.assign(data, { app_id: app_id });
  }
  const message = JSON.stringify(data);
  const buffer = stringToByte(message);

  switch (currentPlatform()) {
    case EPlatform.android:
      return setNotification(buffer);
    case EPlatform.ios:
      return sendJsCoreNotification(message);
    case EPlatform.desktop:
    default:
      return;
  }
}

export interface INotification {
  title: string; // 消息标题
  body: string; // 消息主体
  app_id?: string; // appId 表示消息需要传递到哪里
  priority: number; // 消息优先级
}

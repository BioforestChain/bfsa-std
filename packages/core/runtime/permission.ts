import { network } from "../deno/network.ts";
import { callNative } from "../native/native.fn.ts";
// import jscore from "../jscore/jscore.ts";
import { isAndroid } from "./device.ts";

/**
 * 申请权限
 * @param permissions
 * @returns boolean
 */
export async function applyPermissions(permissions: EPermissions) {
  if (isAndroid) {
    const per = await network.asyncCallDenoFunction(
      callNative.ApplyPermissions,
      {
        permissions,
      }
    );
    return per;
  } else {
    // TODO(kingsword09): 权限和android有点对不上
    // const per = jscore.callJavaScriptWithFunctionNameParam(
    //   callNative.ApplyPermissions,
    //   JSON.stringify(permissions)
    // );
    // return per;
  }
}

export enum EPermissions {
  PERMISSION_CALENDAR = "PERMISSION_CALENDAR", // 日历
  PERMISSION_CAMERA = "PERMISSION_CAMERA", // 相机相册
  PERMISSION_CONTACTS = "PERMISSION_CONTACTS", // 联系人
  PERMISSION_LOCATION = "PERMISSION_LOCATION", // 位置
  PERMISSION_RECORD_AUDIO = "PERMISSION_RECORD_AUDIO", // 录音
  PERMISSION_BODY_SENSORS = "PERMISSION_BODY_SENSORS", // 传感器（重力，陀螺仪）
  PERMISSION_STORAGE = "PERMISSION_STORAGE", // 存储
  PERMISSION_SMS = "PERMISSION_SMS", // 短信
  PERMISSION_CALL = "PERMISSION_CALL", // 电话
  PERMISSION_DEVICE = "PERMISSION_DEVICE", // （手机状态）
}

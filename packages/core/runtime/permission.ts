import { network } from "../deno/network.ts";
import { callNative } from "../native/native.fn.ts";
import { currentPlatform, EPlatform } from './platform.ts';

/**
 * 申请权限(如果没有或者被拒绝，那么会强制请求打开权限（设置）)
 * @param permissions
 * @returns boolean
 */
export async function applyPermissions(permissions: string) {
  // 处理映射为ios
  if (currentPlatform() === EPlatform.ios) {
    const permission = permissions as keyof typeof EIosPermissions;
    console.log("deno#applyPermissions：", permission)
    // 映射为ios权限
    if (permission && EIosPermissions[permission]) {
      permissions = EIosPermissions[permission]
    }
  }
  console.log("deno#applyPermissions：", permissions, currentPlatform());
  const per = await network.asyncCallDenoFunction(
    callNative.applyPermissions,
    {
      permissions,
    }
  );
  return per;
}

/**
 * 获取权限信息
 * @returns Promsie<EPermissions>
 */
export async function getPermissions() {
  return await network.asyncCallDenoFunction(callNative.getPermissions)
}


export enum EPermissions {
  /**相机 */
  CAMERA = "PERMISSION_CAMERA",
  /**相册 */
  PHOTO = "PERMISSION_PHOTO",
  /**位置 */
  LOCATION = "PERMISSION_LOCATION",
  /**网络 */
  NETWORK = "PERMISSION_NETWORK",
  /**录音 */
  RECORD_AUDIO = "PERMISSION_RECORD_AUDIO",
  /**媒体库 */
  MEDIA = "PERMISSION_MEDIA",
  /**联系人 */
  CONTACTS = "PERMISSION_CONTACTS",
  /**通知 */
  NOTIFICATION = "PERMISSION_NOTIFICATION",
  /**蓝牙 */
  BLUETOOTH = "PERMISSION_BLUETOOTH",

  /**日历 */
  CALENDAR = "PERMISSION_CALENDAR",
  /**传感器（重力，陀螺仪） */
  BODY_SENSORS = "PERMISSION_BODY_SENSORS",
  /**存储 */
  STORAGE = "PERMISSION_STORAGE",
  /**短信 */
  SMS = "PERMISSION_SMS",
  /**电话 */
  CALL = "PERMISSION_CALL",
  /**手机状态 */
  DEVICE = "PERMISSION_DEVICE",
}

export enum EAndroidPermissions {
  /**相机 */
  CAMERA = "PERMISSION_CAMERA",
  /**相册 */
  PHOTO = "PERMISSION_PHOTO",
  /**位置 */
  LOCATION = "PERMISSION_LOCATION",
  /**网络 */
  NETWORK = "PERMISSION_NETWORK",
  /**录音 */
  RECORD_AUDIO = "PERMISSION_RECORD_AUDIO",
  /**媒体库 */
  MEDIA = "PERMISSION_MEDIA",
  /**联系人 */
  CONTACTS = "PERMISSION_CONTACTS",
  /**通知 */
  NOTIFICATION = "PERMISSION_NOTIFICATION",
  /**蓝牙 */
  BLUETOOTH = "PERMISSION_BLUETOOTH",
}

export enum EIosPermissions {
  /**相机 */
  CAMERA = "camera",
  /**相册 */
  PHOTO = "photo",
  /**定位 */
  LOCATION = "location",
  /**网络 */
  NETWORK = "network",
  /**麦克风 */
  RECORD_AUDIO = "microphone",
  /**媒体库 */
  MEDIA = "media",
  /**通讯录 */
  CONTACTS = "contact",
  /**通知 */
  PNOTIFICATION = "notification",
  /**蓝牙 */
  BLUETOOTH = "bluetooth"
}

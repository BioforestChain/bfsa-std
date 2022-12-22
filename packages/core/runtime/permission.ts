import { network } from "../deno/network.ts";
import { callNative } from "../native/native.fn.ts";
import { currentPlatform, EPlatform } from './platform.ts';

/**
 * 申请权限
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
  PERMISSION_CAMERA = "PERMISSION_CAMERA",
  /**相册 */
  PERMISSION_PHOTO = "PERMISSION_PHOTO",
  /**位置 */
  PERMISSION_LOCATION = "PERMISSION_LOCATION",
  /**网络 */
  PERMISSION_NETWORK = "PERMISSION_NETWORK",
  /**录音 */
  PERMISSION_RECORD_AUDIO = "PERMISSION_RECORD_AUDIO",
  /**媒体库 */
  PERMISSION_MEDIA = "PERMISSION_MEDIA",
  /**联系人 */
  PERMISSION_CONTACTS = "PERMISSION_CONTACTS",
  /**通知 */
  PERMISSION_NOTIFICATION = "PERMISSION_NOTIFICATION",
  /**蓝牙 */
  PERMISSION_BLUETOOTH = "PERMISSION_BLUETOOTH",

  /**日历 */
  PERMISSION_CALENDAR = "PERMISSION_CALENDAR",
  /**传感器（重力，陀螺仪） */
  PERMISSION_BODY_SENSORS = "PERMISSION_BODY_SENSORS",
  /**存储 */
  PERMISSION_STORAGE = "PERMISSION_STORAGE",
  /**短信 */
  PERMISSION_SMS = "PERMISSION_SMS",
  /**电话 */
  PERMISSION_CALL = "PERMISSION_CALL",
  /**手机状态 */
  PERMISSION_DEVICE = "PERMISSION_DEVICE",
}

export enum EAndroidPermissions {
  /**相机 */
  PERMISSION_CAMERA = "PERMISSION_CAMERA",
  /**相册 */
  PERMISSION_PHOTO = "PERMISSION_PHOTO",
  /**位置 */
  PERMISSION_LOCATION = "PERMISSION_LOCATION",
  /**网络 */
  PERMISSION_NETWORK = "PERMISSION_NETWORK",
  /**录音 */
  PERMISSION_RECORD_AUDIO = "PERMISSION_RECORD_AUDIO",
  /**媒体库 */
  PERMISSION_MEDIA = "PERMISSION_MEDIA",
  /**联系人 */
  PERMISSION_CONTACTS = "PERMISSION_CONTACTS",
  /**通知 */
  PERMISSION_NOTIFICATION = "PERMISSION_NOTIFICATION",
  /**蓝牙 */
  PERMISSION_BLUETOOTH = "PERMISSION_BLUETOOTH"
}

export enum EIosPermissions {
  /**相机 */
  PERMISSION_CAMERA = "camera",
  /**相册 */
  PERMISSION_PHOTO = "photo",
  /**定位 */
  PERMISSION_LOCATION = "location",
  /**网络 */
  PERMISSION_NETWORK = "network",
  /**麦克风 */
  PERMISSION_RECORD_AUDIO = "microphone",
  /**媒体库 */
  PERMISSION_MEDIA = "media",
  /**通讯录 */
  PERMISSION_CONTACTS = "contact",
  /**通知 */
  PERMISSION_NOTIFICATION = "notification",
  /**蓝牙 */
  PERMISSION_BLUETOOTH = "bluetooth"
}

import { network } from "../deno/network.ts";
import { callNative } from "../native/native.fn.ts";
import { currentPlatform } from './platform.ts';


export async function warpPermissions(cmd: string, permissions: string) {
  console.log("deno#warpPermissions 权限申请:", cmd, permissions)
  if (cmd === callNative.applyPermissions) {
    return await applyPermissions(permissions)
  }
  if (cmd === callNative.checkCameraPermission) {
    return await applyPermissions(EPermissions.CAMERA)
  }
  if (cmd === callNative.getPermissions) {
    return await getPermissions()
  }
  return ""
}

/**
 * 申请权限(如果没有或者被拒绝，那么会强制请求打开权限（设置）)
 * @param permissions
 * @returns boolean
 */
export async function applyPermissions(permissions: string) {
  console.log("deno#applyPermissions：", permissions, currentPlatform());
  return await network.asyncCallDenoFunction(callNative.applyPermissions, permissions);
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
  /**位置 */
  LOCATION = "PERMISSION_LOCATION",
  /**联系人 */
  CONTACTS = "PERMISSION_CONTACTS",
  /**录音 */
  RECORD_AUDIO = "PERMISSION_RECORD_AUDIO",

  /**相册(ios only) */
  PHOTO = "PERMISSION_PHOTO",
  /**网络(ios only) */
  NETWORK = "PERMISSION_NETWORK",
  /**媒体库(ios only) */
  MEDIA = "PERMISSION_MEDIA",
  /**通知(ios only) */
  NOTIFICATION = "PERMISSION_NOTIFICATION",
  /**蓝牙(ios only) */
  BLUETOOTH = "PERMISSION_BLUETOOTH",

  /**日历(android only) */
  CALENDAR = "PERMISSION_CALENDAR",
  /**传感器（重力，陀螺仪）(android only) */
  BODY_SENSORS = "PERMISSION_BODY_SENSORS",
  /**存储(android only) */
  STORAGE = "PERMISSION_STORAGE",
  /**短信(android only) */
  SMS = "PERMISSION_SMS",
  /**电话(android only) */
  CALL = "PERMISSION_CALL",
  /**手机状态(android only) */
  DEVICE = "PERMISSION_DEVICE",
}

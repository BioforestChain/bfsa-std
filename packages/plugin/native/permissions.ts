import { DwebPlugin } from "./dweb-plugin.ts";
import { NativeHandle } from '../common/nativeHandle.ts';
export class Permissions extends DwebPlugin {
  constructor() {
    super();
  }
  /**
   * 检查是否有摄像头权限，如果没有或者被拒绝，那么会强制请求打开权限（设置）
   * @param per 
   * @returns 
   */
  async checkCameraPermission() {
    const result = await this.onRequest(NativeHandle.CheckCameraPermission, EPermissions.CAMERA);
    return result
  }
  /**
   *  申请多个权限
   * @param per 
   * @returns 
   */
  async applyPermissions(per: EPermissions[]) {
    const result = await this.onRequest(NativeHandle.ApplyPermissions, per.join());
    return result
  }
  /**
   *  申请多个权限
   * @param per 
   * @returns 
   */
  async applyPermission(per: EPermissions) {
    const result = await this.onRequest(NativeHandle.ApplyPermissions, per);
    return result
  }

}

if (!customElements.get("dweb-permission")) {
  customElements.define("dweb-permission", Permissions);
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
  PERMISSION_SMS = "PERMISSION_SMS",
  /**电话 */
  CALL = "PERMISSION_CALL",
  /**手机状态 */
  DEVICE = "PERMISSION_DEVICE",
}

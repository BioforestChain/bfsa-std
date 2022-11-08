import { callDeno } from "../deno/android.fn.ts";
import { network } from "../deno/network.ts";


export const isAndroid = await isDenoRuntime();

/**获取设备信息 */
export async function getDeviceInfo(): Promise<IDeviceInfo> {
  let info = "";
  try {
    info = await network.asyncCallDenoFunction(callDeno.getDeviceInfo);
  } catch (e) {
    console.log("device:", e);
    // info = await netCallNativeService(callNative.getDeviceInfo);
  }
  return JSON.parse(info);
}

/**判断是不是denoRuntime环境 */
export function isDenoRuntime() {
  try {
    // PlaocJavascriptBridge.callJavaScriptFunction('isDenoRuntime', '参数')
  } catch (_error) {

  }
  // console.log("是android 环境吗？", info.isDeno);
  return true;
}


interface IDeviceInfo {
  name: string; // 设备名称 ios / android
  model: string; // 设备型号 ios / android
  modelName?: string; // 设备具体型号 ios
  systemVersion: string; // 版本号 ios / android
  localizedModel: string; // 设备区域化型号 ios
  processor?: string; // 处理器  android
  memory?: IMemoryData; // 运行内存 android
  storage?: IStorageSize; // 存储 android
  screen?: string; // 屏幕 android
  phone?: string; // 手机号码 android
  module: EDeviceModule; // 手机模式(silentMode,doNotDisturb,default)
  isDeno?: boolean; // android
}

export enum EDeviceModule {
  default = "default",
  silentMode = "silentMode",
  doNotDisturb = "doNotDisturb",
}

interface IMemoryData {
  total: string;
  usage: string;
  free: string;
  buffers: string;
}

interface IStorageSize {
  hasExternalSDCard: boolean;
  internalTotalSize: string;
  internalFreeSize: string;
  externalTotalSize: string;
  externalFreelSize: string;
}

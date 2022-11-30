import { callNative } from "../native/native.fn.ts";
import { network } from "../deno/network.ts";
import { bufferToString, checkType } from "../../util/index.ts";
import { netCallNativeService } from "../jscore/swift.op.ts";



/**获取设备信息 */
export async function getDeviceInfo(): Promise<IDeviceInfo> {
  let info = "";

  if (isDenoRuntime()) {
    info = await network.asyncCallDenoFunction(callNative.getDeviceInfo);
  } else {
    const data = await netCallNativeService(callNative.getDeviceInfo);
    info = bufferToString(data.buffer)
  }
  console.log("device:", info);
  return JSON.parse(info);
}

/**判断是不是denoRuntime环境 */
export function isDenoRuntime() {
  return checkType("Deno", "object");
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

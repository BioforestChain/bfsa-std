import jscore from "../jscore/jscore.ts";
import { isDenoRuntime } from "./device.ts";

/** 判断当前属于哪个平台 */
export function currentPlatform() {
  let platform = "";

  if (jscore) {
    platform = "ios";
  } else if (isDenoRuntime()) {
    platform = "android";
  } else {
    platform = "desktop";
  }

  return platform;
}

export enum EPlatform {
  ios = "ios",
  android = "android",
  desktop = "desktop"
}

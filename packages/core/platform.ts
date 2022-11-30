import jscore from "./jscore/jscore.ts";
import { isDenoRuntime } from "./runtime/device.ts";

/** 判断当前属于哪个平台 */
export function currentPlatform() {
  let platform = "";

  if (jscore) {
    platform = "iOS";
  } else if (isDenoRuntime()) {
    platform = "Android";
  } else {
    platform = "desktop-dev";
  }

  return platform;
}

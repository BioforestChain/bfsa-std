/////////////////////////////
/// 核心调度代码
/////////////////////////////

export {
  openBarScanner,
  openQrScanner,
  DWebView,
  sendNotification,
  // isDenoRuntime,
  getDeviceInfo,
  EDeviceModule,
  EPermissions,
  applyPermissions,
} from "./runtime/index.ts";
export { network } from "./deno/network.ts";
export { currentPlatform } from "./platform.ts";

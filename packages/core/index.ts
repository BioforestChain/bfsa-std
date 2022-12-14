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
  EPlatform,
  applyPermissions,
  getPermissions,
  currentPlatform,
} from "./runtime/index.ts";
export { network } from "./deno/network.ts";

// 记得大写开头，跟Native enum  保持一直
export enum callNative {
  /**打开dwebView */
  openDWebView = "OpenDWebView",
  /**二维码 */
  openQrScanner = "OpenQrScanner",
  /**条形码 */
  openBarcodeScanner = "BarcodeScanner",
  /**初始化app数据 */
  initMetaData = "InitMetaData",
  /**初始化运行时 */
  denoRuntime = "DenoRuntime",
  /**获取appid */
  getBfsAppId = "GetBfsAppId",
  /**传递给前端消息 */
  evalJsRuntime = "EvalJsRuntime",
  /**获取设备信息 */
  getDeviceInfo = "GetDeviceInfo",
  /**发送消息 */
  sendNotification = "SendNotification",
  /**申请权限 */
  applyPermissions = "ApplyPermissions",
  /**获取权限 */
  getPermissions = "GetPermissions",

  /** serviceworker 告知已经准备好 */
  serviceWorkerReady = "ServiceWorkerReady",
  /**设置dwebview的ui */
  setDWebViewUI = "SetDWebViewUI",
}


export enum callNotReturnNative {
  /**退出app */
  exitApp = "ExitApp",
}


// 回调到对应的组件
export enum callDVebView {
  BarcodeScanner = "dweb-scanner",
  OpenQrScanner = "dweb-scanner",
  OpenDWebView = "dweb-view",
  ExitApp = "dweb-app",
}
// const callDeno

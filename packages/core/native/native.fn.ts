// 记得大写开头，跟Native enum  保持一直
export enum callNative {
  openDWebView = "OpenDWebView",
  openQrScanner = "OpenQrScanner", // 二维码
  openBarcodeScanner = "BarcodeScanner", // 条形码
  initMetaData = "InitMetaData", //  初始化app数据
  denoRuntime = "DenoRuntime", // 初始化运行时
  getBfsAppId = "GetBfsAppId", // 获取appid
  evalJsRuntime = "EvalJsRuntime", // 传递给前端消息
  getDeviceInfo = "GetDeviceInfo", // 获取设备信息
  sendNotification = "SendNotification", // 发送消息
  applyPermissions = "ApplyPermissions", // 申请权限
  getPermissions = "GetPermissions", // 获取权限

  ServiceWorkerReady = "ServiceWorkerReady", // serviceworker 已经准备好

  setDWebViewUI = "SetDWebViewUI", // 设置dwebview的ui
}


// 回调到对应的组件
export enum callDVebView {
  BarcodeScanner = "dweb-scanner",
  OpenQrScanner = "dweb-scanner",
  OpenDWebView = "dweb-view",
}
// const callDeno

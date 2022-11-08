export enum callKotlin {
  callSWMessage = "CallSWMessage", // 发送消息给serviceWorker message
  setDWebViewUI = "SetDWebViewUI", // 设置dwebview的ui
}

// 回调到对应的组件
export enum callDVebView {
  BarcodeScanner = "dweb-scanner",
  OpenQrScanner = "dweb-scanner",
  OpenDWebView = "dweb-view",
}
// const callDeno

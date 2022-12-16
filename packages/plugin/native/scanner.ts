import { NativeHandle } from "../common/nativeHandle.ts";
import { DwebPlugin } from "./dweb-plugin.ts";

export class OpenScanner extends DwebPlugin {
  constructor() {
    super();
  }
  // 打开二维码扫码
  openQrCodeScanner(): Promise<string> {
    return this.onRequest(NativeHandle.OpenQrScanner) as Promise<string>;
  }

  // 打开条形码扫码
  openBarCodeScanner(): Promise<string> {
    return this.onRequest(NativeHandle.BarcodeScanner) as Promise<string>;
  }
}

if (!customElements.get("dweb-scanner")) {
  customElements.define("dweb-scanner", OpenScanner);
}
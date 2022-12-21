import { _decoder } from "../common/index.ts";
import { NativeHandle } from "../common/nativeHandle.ts";
import { DwebPlugin } from "./dweb-plugin.ts";

export class OpenScanner extends DwebPlugin {
  constructor() {
    super();
  }
  private async scanner(type: NativeHandle) {
    const result = await this.onRequest(type);
    if (ArrayBuffer.isView(result)) {
      return _decoder.decode(result)
    }
    return result
  }
  // 打开二维码扫码
  async openQrCodeScanner(): Promise<string> {
    return await this.scanner(NativeHandle.OpenQrScanner)
  }

  // 打开条形码扫码
  async openBarCodeScanner(): Promise<string> {
    return await this.scanner(NativeHandle.BarcodeScanner)
  }
}

if (!customElements.get("dweb-scanner")) {
  customElements.define("dweb-scanner", OpenScanner);
}

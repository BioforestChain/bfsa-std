import { _decoder } from "../../util/binary.ts";
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

  // 打开/关闭手电筒
  async toggleTorch() {
    return await this.onRequest(NativeHandle.ToggleTorch);
  }

  // 获取手电筒状态
  async getTorchState() {
    return await this.onRequest(NativeHandle.GetTorchState)
  }
}

if (!customElements.get("dweb-scanner")) {
  customElements.define("dweb-scanner", OpenScanner);
}

import { callNative } from "../native/native.fn.ts";
import { network } from "../deno/network.ts";
import jscore from "../jscore/jscore.ts";
import { isAndroid } from "./device.ts";
/**
 * 打开二维码扫码
 * @returns Promise<data>
 */
export const openQrScanner = () => {
  return new Promise(() => {
    if (isAndroid) {
      network.syncCallDenoFunction(callNative.openQrScanner);
    } else {
      jscore.callJavaScriptWith(callNative.openQrScanner);
    }
  });
};

/**
 * 打开条形码扫码
 * @returns Promise<data>
 */
export const openBarScanner = () => {
  return new Promise(() => {
    if (isAndroid) {
      network.syncCallDenoFunction(callNative.openBarcodeScanner);
    } else {
      jscore.callJavaScriptWith(callNative.openBarcodeScanner);
    }
  });
};

import { callNative } from "../native/native.fn.ts";
import { network } from "../deno/network.ts";
import jscore from "../jscore/jscore.ts";
import { currentPlatform } from "./platform.ts";
/**
 * 打开二维码扫码
 * @returns Promise<data>
 */
export const openQrScanner = () => {
  return new Promise(() => {
    if (currentPlatform() === "Android") {
      network.syncCallDenoFunction(callNative.openQrScanner);
    } else {
      jscore.callJavaScriptWithFunctionNameParam(callNative.openQrScanner, "");
    }
  });
};

/**
 * 打开条形码扫码
 * @returns Promise<data>
 */
export const openBarScanner = () => {
  return new Promise(() => {
    if (currentPlatform() === "Android") {
      network.syncCallDenoFunction(callNative.openBarcodeScanner);
    } else {
      jscore.callJavaScriptWithFunctionNameParam(
        callNative.openBarcodeScanner,
        ""
      );
    }
  });
};

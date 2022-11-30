import { callNative } from "../native/native.fn.ts";
import { network } from "../deno/network.ts";
/**
 * 打开二维码扫码
 * @returns Promise<data>
 */
export const openQrScanner = () => {
  network.syncCallDenoFunction(callNative.openQrScanner);
};

/**
 * 打开条形码扫码
 * @returns Promise<data>
 */
export const openBarScanner = () => {
  network.syncCallDenoFunction(callNative.openBarcodeScanner);
};

export * from "./src/index.ts";


import { checkType } from "../../util/index.ts"

export const isWebView = checkType("navigator", "object");

export const isAndroid = isWebView && /Android/i.test(navigator.userAgent);

export const isIOS = isWebView && /iPhone|iPod|iPad/i.test(navigator.userAgent);

import { TNative } from "../index.ts";

/** javascriptCore function */
export interface PlaocJavascriptBridge {
  callJavaScriptWithFunctionNameParam: (
    functionName: string,
    param: TNative
  ) => Uint8Array;
}

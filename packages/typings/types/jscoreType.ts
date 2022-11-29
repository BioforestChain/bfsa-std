/** javascriptCore function */
export interface PlaocJavascriptBridge {
  callJavaScriptWithFunctionNameParam: (
    functionName: string,
    param: string | Uint8Array
  ) => Uint8Array;
}

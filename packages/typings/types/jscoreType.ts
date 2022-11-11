/** javascriptCore function */
export interface PlaocJavascriptBridge {
  callJavaScriptWithFunctionNameParam: (
    functionName: string,
    param?: string
  ) => string;
}

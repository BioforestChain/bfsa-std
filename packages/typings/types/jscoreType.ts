/** javascriptCore function */
export interface PlaocJavascriptBridge {
  callJavaScriptWith: (functionName: string, param?: string) => string;
}

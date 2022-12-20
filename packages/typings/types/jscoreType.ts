// deno-lint-ignore ban-types
export type TNative = boolean | object | string | number | ArrayBufferView;

/** javascriptCore function */
export interface PlaocJavascriptBridge {
  callJavaScriptWithFunctionNameParam: (
    functionName: string,
    param: TNative
  ) => Uint8Array;
}

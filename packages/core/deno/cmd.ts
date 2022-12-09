
export type IO_TYPE = string | number | boolean | null | ArrayBuffer | ArrayBufferView;
export interface $Command<I extends readonly IO_TYPE[] = IO_TYPE[], O extends IO_TYPE = IO_TYPE> {
  input: I;
  ouput: O;
}

export type $A2BCommands = {
  asyncStrngHasReturn: $Command<[data: string], ArrayBuffer>;
  asyncNumberHasReturn: $Command<[data: number], ArrayBuffer>;
  asyncBoolHasReturn: $Command<[data: boolean], ArrayBuffer>;
  asyncBuffHasReturn: $Command<[data: ArrayBufferView], ArrayBuffer>;
  syncCallNotReturn: $Command<[], ArrayBuffer>;
  // [callNative.openDWebView]: $Command<[entry: string], []>;
  // [callNative.openQrScanner]: $Command<[], [success: string]>;
  // [callNative.openBarcodeScanner]: $Command<[], [success: string]>;
  // [callNative.initMetaData]: $Command<[ metaData: string], []>;
  // [callNative.denoRuntime]: $Command<[entry: string], []>;
  // [callNative.getBfsAppId]: $Command<[], [app_id: string]>;
  // [callNative.evalJsRuntime]: $Command<[ js_code: string], []>;
  // [callNative.getDeviceInfo]: $Command<[], [info: string]>;
  // [callNative.sendNotification]: $Command<[age: number, name: string], [success: boolean]>;
  // [callNative.applyPermissions]: $Command<[permissions: string], [success: boolean]>;

  // [callNative.ServiceWorkerReady]: $Command<[age: number, name: string], [success: boolean]>;
};

// type $B2ACommands = {
//   test1:$Command<[age:number, name:string], [success:boolean]>
//   test2:$Command<[age:number, name:string], [success:boolean]>
// } ;
export namespace $Commands {
  type _Commands = Record<string, $Command>;
  export type Cmd<CS extends _Commands = $A2BCommands> = keyof CS;
  export type Input<C extends Cmd<CS>, CS extends _Commands = $A2BCommands> = CS[C]["input"];
  export type Output<C extends Cmd<CS>, CS extends _Commands = $A2BCommands> = CS[C]["ouput"];
}
let _L = 0;
export enum Transform_Type {
  /**包含返回值的消息 */
  NOT_RETURN = 1 << _L++, // 1 
  /**通用的消息 */
  HAS_RETURN = 1 << _L++, // 2
  /**传递buffer的消息 */
  IS_ALL_BUFFER = 1 << _L++, // 4
  // IS_ALL_JSON = 1 >> L++,
  // IS_ALL_STRING = 1 >> L++,
  // IS_ALL_U32 = 1 >> L++,
  // IS_ALL_BOOLEAN = 1 >> L++,
}

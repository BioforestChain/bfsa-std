/////////////////////////////
/// 这里封装后端调用的异步方法
/////////////////////////////
import { TNative } from "@bfsx/typings";
import { deno } from "./deno.ts";
import { $A2BCommands, Transform_Type } from "./cmd.ts";
import { currentPlatform, EPlatform } from "../runtime/platform.ts";
import { netCallNativeService } from "../jscore/swift.op.ts";
import { _decoder } from '../../util/binary.ts';


type $THandle = keyof $A2BCommands;

export class Network {
  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns
   */
  async asyncCallDenoFunction(
    handleFn: string,
    data: TNative = "",
  ): Promise<string> {
    return await this.asyncSendMsgNative(handleFn, data).then((data) => {
      if (currentPlatform() === EPlatform.ios) {
        return data
      }
      const result = _decoder.decode(data)
      return result;
    }).catch((err) => {
      console.log("deno#asyncCallDenoFunction err", err);
      return err;
    });
  }

  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns  Buffer
   */
  async asyncCallbackBuffer(
    handleFn: string,
    data: TNative = "",
  ): Promise<ArrayBuffer> {
    return await this.asyncSendMsgNative(handleFn, data);
  }

  /**
   * 异步发送消息到android/ios
   * @param handleFn 
   * @param data 
   * @returns 
   */
  async asyncSendMsgNative(
    handleFn: string,
    data: TNative = "",
  ): Promise<ArrayBuffer> {
    // 发送消息的类型（标记为需要消息返回）
    const type: number = Transform_Type.HAS_RETURN;

    if (data instanceof Object && !ArrayBuffer.isView(data)) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }
    // console.log("deno#asyncSendMsgNative request: ", handleFn, data)

    // 处理IOS，可以不转buffer就不转，少了一道工序
    if (currentPlatform() === EPlatform.ios) {
      const msg = await netCallNativeService(handleFn, data);
      return msg;
    }


    // 发送请求
    const buffer = await deno.request(handleFn as $THandle, [data], type)
    // console.log("deno#asyncSendMsgNative Response: ", buffer)
    return buffer;
  }

  /**
   * 同步调用方法没返回值
   * @param handleFn
   * @param data
   */
  async syncSendMsgNative(handleFn: string, data: TNative = ""): Promise<void> {
    // 发送消息的类型 （标记为不需要返回）
    const type: number = Transform_Type.NOT_RETURN;
    if (data instanceof Object) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }

    // 处理IOS，
    if (currentPlatform() === EPlatform.ios) {
       netCallNativeService(handleFn, data);
       return
    }
    console.log("syncSendMsgNative#request: ", handleFn, data)

    await deno.request(handleFn as $THandle, [data], type); // 发送请求
  }

  /**
   * 分段发送buffer请求到native
   * @param handleFn 
   * @param data 
   * @returns 
   */
  async asyncSendBufferNative(handleFn: string, data: ArrayBufferView[]) {
    // 发送消息的类型（标记为需要消息返回，并且是二进制传输）
    const type: number = Transform_Type.HAS_RETURN | Transform_Type.IS_ALL_BUFFER;
    // 处理IOS，
    if (currentPlatform() === EPlatform.ios) {
      netCallNativeService(handleFn, data);
    }
    // 发送请求
    const buffer = await deno.request(handleFn as $THandle, data as [ArrayBufferView], type)
    console.log("deno#asyncSendBufferNative Response: ", buffer)
    return buffer;
  }
}

export type TNextBit = {
  value: Uint8Array;
  versionView: number[];
  headView: number[];
  done: boolean;
};

export const network = new Network();

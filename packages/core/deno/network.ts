/////////////////////////////
/// 这里封装后端调用的异步方法
/////////////////////////////
import { TNative } from "@bfsx/typings";
import { bufferToString } from "../../util/binary.ts";
import { deno } from "./deno.ts";
import { $A2BCommands, Transform_Type } from "./cmd.ts";
import { currentPlatform } from "../runtime/platform.ts";
import { netCallNativeService } from "../jscore/swift.op.ts";


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
    return await this.asyncCallDeno(handleFn, data).then((data) => {
      const result = bufferToString(data);
      console.log("xasyncCallDenoFunctionx", result);
      return result;
    }).catch((err) => {
      console.log("xasyncCallDenoFunctionx", err);
      return err;
    });
  }

  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns  Buffer
   */
  async asyncCallDenoBuffer(
    handleFn: string,
    data: TNative = "",
  ): Promise<ArrayBuffer> {
    return await this.asyncCallDeno(handleFn, data);
  }

  async asyncCallDeno(
    handleFn: string,
    data: TNative = "",
  ): Promise<ArrayBuffer> {
    if (data instanceof Object && !ArrayBuffer.isView(data)) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }
    console.log("asyncCallDeno#request: ", handleFn, data)

    // 处理IOS，可以不转buffer就不转，少了一道工序
    if (currentPlatform() === "iOS") {
      const msg = await netCallNativeService(handleFn, data);
      return msg;
    }

    // 发送消息的类型
    const type: number = Transform_Type.COMMON;
    // 发送请求
    const buffer = await deno.request(handleFn as $THandle, [data], type)
    console.log("asyncCallDeno#Response: ", buffer[0])
    return buffer[0];
    // return Promise.resolve(new ArrayBuffer(1));
    // // console.log(`asyncCallDenoFunction：发送请求：${headView[0]}: ${decoder.decode(new Uint8Array((data as string).split(",").map((v: string | number) => +v)))}`);
  }
  /**
   * 同步调用方法没返回值
   * @param handleFn
   * @param data
   */
  syncCallDenoFunction(handleFn: string, data: TNative = ""): void {
    if (data instanceof Object) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }
    console.log("syncCallDenoFunction#request: ", handleFn, data)
    // 发送消息的类型
    const type: number = Transform_Type.HAS_RETURN;
    deno.request(handleFn as $THandle, [data], type); // 发送请求
  }
}

export type TNextBit = {
  value: Uint8Array;
  versionView: number[];
  headView: number[];
  done: boolean;
};

export const network = new Network();

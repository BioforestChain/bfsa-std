/////////////////////////////
/// 这里封装后端调用的异步方法
/////////////////////////////
import { TNative } from "@bfsx/typings";
import { decoder } from "../../util/binary.ts";
import deno from "./deno.ts";
import { loopRustBuffer } from "./rust.op.ts";

const RUST_DATA_CATCH = new Map<number, Uint8Array>()
export class Network {
  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns
   */
  async asyncCallDenoFunction(
    handleFn: string,
    data: TNative = "''"
  ): Promise<string> {
    const buffer = await this.asyncCallDeno(handleFn, data)
    return decoder.decode(buffer)
  }

  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns  Buffer
   */
  asyncCallDenoBuffer(
    handleFn: string,
    data: TNative = "''",
  ): Promise<Uint8Array> {
    return this.asyncCallDeno(handleFn, data)
  }

  async asyncCallDeno(
    handleFn: string,
    data: TNative = "''"
  ): Promise<Uint8Array> {
    if (data instanceof Object) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }
    const { headView, msg } = deno.callFunction(
      handleFn,
      JSON.stringify(data)
    ); // 发送请求
    // 如果直接有msg返回，那么就代表非denoRuntime环境
    if (msg) {
      return msg
    }
    do {
      const data = await loopRustBuffer().next();  // backSystemDataToRust
      if (data.done) {
        continue;
      }
      console.log("asyncCallDenoFunction headView  ====> ", data.value);
      console.log("请求返回的:", data.headView[0], " 创建的 ", headView[0]);
      // 如果请求是返回了是同一个表示头则返回成功
      if (headView[0] === data.headView[0]) {
        return data.value
      }
      // 如果需要的跟请求返回的不同 先看缓存里有没有
      if (RUST_DATA_CATCH.has(headView[0])) {
        const value = RUST_DATA_CATCH.get(headView[0])!;
        RUST_DATA_CATCH.delete(headView[0])
        return value
      }
      // 如果不存在，则先存起来
      RUST_DATA_CATCH.set(data.headView[0], data.value)
    } while (true);
  }


  /**
   * 同步调用方法没返回值
   * @param handleFn
   * @param data
   */
  syncCallDenoFunction(handleFn: string, data: TNative = "''"): void {
    if (data instanceof Object) {
      data = JSON.stringify(data); // stringify 两次转义一下双引号
    }
    deno.callFunction(handleFn, JSON.stringify(data)); // 发送请求
  }
}


type loopRustBuffer = (opFunction: string) => {
  next(): Promise<TNextBit>;
  return(): void;
  throw(): void;
};

type TNextBit = {
  value: Uint8Array;
  versionView: number[];
  headView: number[];
  done: boolean;
}

export const network = new Network();

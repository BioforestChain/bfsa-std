/////////////////////////////
/// 这里封装后端调用的异步方法
/////////////////////////////
import { TNative } from "@bfsx/typings";
import { decoder } from "../../util/binary.ts";
import deno from "./deno.ts";
import { getRustBuffer } from "./rust.op.ts";
import { EasyMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyMap.ts";
const RUST_DATA_CATCH = EasyMap.from({
  transformKey(key: Uint8Array) {
    return `${key[0]}-${key[1]}`;
  },
  creater() {
    return new Uint8Array();
  },
});
export class Network {
  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns
   */
  async asyncCallDenoFunction(
    handleFn: string,
    data: TNative = "''",
  ): Promise<string> {
    return await this.asyncCallDeno(handleFn, data).then((buffer) => {
      console.log("xasyncCallDenoFunctionx", buffer);
      return decoder.decode(buffer);
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
  asyncCallDenoBuffer(
    handleFn: string,
    data: TNative = "''",
  ): Promise<Uint8Array> {
    return this.asyncCallDeno(handleFn, data);
  }

  async asyncCallDeno(
    handleFn: string,
    data: TNative = "''",
  ): Promise<Uint8Array> {
      if (data instanceof Object) {
        data = JSON.stringify(data); // stringify 两次转义一下双引号
      }
      // 发送请求
      const { headView, msg } = await deno.callFunction(
        handleFn,
        JSON.stringify(data),
      );
      // console.log(`asyncCallDenoFunction：发送请求：${headView[0]}: ${decoder.decode(new Uint8Array((data as string).split(",").map((v: string | number) => +v)))}`);
      // 如果直接有msg返回，那么就代表非denoRuntime环境
      if (msg.byteLength !== 0) {
        return msg;
      }
      do {
        const result = await getRustBuffer(headView); // backSystemDataToRust

        if (result.done) {
          if (RUST_DATA_CATCH.tryHas(headView)) {
            // 拿到缓存里的
            const value = RUST_DATA_CATCH.forceGet(headView)!;
            RUST_DATA_CATCH.tryDelete(headView);
            // console.log("asyncCallDenoFunction：11😄缓存里拿的：", headView[0])
            return value;
          }
          continue;
        }

        // console.log(`asyncCallDenoFunction：🚑：找到返回值${result.headView[0]},当前请求的：${headView[0]}
        //     ${decoder.decode(new Uint8Array((data as string).split(",").map((v: string | number) => +v)))}`);

        // 如果请求是返回了是同一个表示头则返回成功
        if (headView[0] === result.headView[0]) {
          // console.log("asyncCallDenoFunction：1😃拿到请求：", headView[0])
          return result.value;
        }

        // 如果需要的跟请求返回的不同 先看缓存里有没有
        if (RUST_DATA_CATCH.tryHas(headView)) {
          // 拿到缓存里的
          const value = RUST_DATA_CATCH.forceGet(headView)!;
          RUST_DATA_CATCH.tryDelete(headView);
          // 如果是拿缓存里的，并且本次有返回，需要存起来
          if (result.value) {
            RUST_DATA_CATCH.trySet(new Uint8Array(result.headView), result.value);
          }
          // console.log("asyncCallDenoFunction：1😄缓存里拿的：", headView[0])
          return value;
        }
        // console.log("asyncCallDenoFunction：1😃未命中,存储请求：", result.headView[0], RUST_DATA_CATCH.tryHas(headView))
        // 如果不存在，则先存起来
        RUST_DATA_CATCH.trySet(new Uint8Array(result.headView), result.value);
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

export type TNextBit = {
  value: Uint8Array;
  versionView: number[];
  headView: number[];
  done: boolean;
};

export const network = new Network();

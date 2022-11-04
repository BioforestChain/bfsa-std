// deno-lint-ignore-file no-async-promise-executor
/////////////////////////////
/// 这里封装后端调用的异步方法
/////////////////////////////
import { TNative } from "@bfsx/typings";
import deno from "./deno.ts";
import { loopRustString, loopRustBuffer } from "./rust.op.ts";

// const deno = new Deno();
export class Network {
  /**
   * 异步调用方法,这个是给后端调用的方法，不会传递数据到前端
   * @param handleFn
   * @param data
   * @returns
   */
  asyncCallDenoFunction(
    handleFn: string,
    data: TNative = "''"
  ): Promise<string> {
    return this.asyncCallDeno(handleFn, data, loopRustString);
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
    return this.asyncCallDeno(handleFn, data, loopRustBuffer);
  }

  asyncCallDeno(
    handleFn: string,
    data: TNative = "''",
    fun: loopRustBuffer | loopRustString
    // deno-lint-ignore no-explicit-any
  ): Promise<any> {
    return new Promise(async (resolve, _reject) => {
      if (data instanceof Object) {
        data = JSON.stringify(data); // stringify 两次转义一下双引号
      }
      const { headView, msg } = deno.callFunction(
        handleFn,
        JSON.stringify(data)
      ); // 发送请求
      // 如果直接有msg返回，那么就代表非denoRuntime环境
      if (msg) {
        return resolve(msg);
      }
      do {
        const data = await fun("op_rust_to_js_system_buffer").next();
        if (data.done) {
          continue;
        }
        console.log("asyncCallDenoFunction headView  ====> ", data.value);
        console.log("data.headView:", data.headView, " xxxx ", headView);
        // 如果请求是返回了是同一个表示头则返回成功
        try {
          const isCur = data!.headView.filter((byte, index) => {
            return byte === Array.from(headView)[index];
          });
          if (isCur.length === 2) {
            resolve(data.value);
            break;
          }
        } catch (error) {
          console.log("asyncCallDenoFunction error", error)
        }
      } while (true);

    });
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
  next(): Promise<{
    value: Uint8Array;
    versionView: number[];
    headView: number[];
    done: boolean;
  }>;
  return(): void;
  throw(): void;
};

type loopRustString = (opFunction: string) => {
  next(): Promise<
    | {
      value: Uint8Array;
      versionView: number[];
      headView: number[];
      done: boolean;
    }
    | {
      value: string;
      versionView: number[];
      headView: number[];
      done: boolean;
    }
  >;
  return(): void;
  throw(): void;
};

export const network = new Network();

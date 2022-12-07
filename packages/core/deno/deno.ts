/////////////////////////////
/// 这里封装调用deno的方法，然后暴露出去
/////////////////////////////

import { send_zero_copy_buffer, js_to_rust_buffer, getRustBuffer } from "./rust.op.ts";
import { stringToByte } from "../../util/binary.ts";
import { PromiseOut } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts';
import { EasyMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyMap.ts";
import { contactUint16 } from "../../util/binary.ts";
import { $A2BCommands, $Commands } from "./cmd.ts";



type $TCmd = $Commands.Output<$Commands.Cmd, $A2BCommands>;
const REQ_CATCH = EasyMap.from({
  creater(_req_id: Uint16Array) {
    return {
      po: new PromiseOut<$TCmd>()
    }
  },
});


class Deno {
  version_id = new Uint16Array([1]);
  reqId = new Uint16Array([0]); // 初始化头部标记

  constructor() {
    // 起一个事件循环读取kotlin返回的数据
    this.loopGetKotlinReturn()
  }

  async request<C extends $Commands.Cmd>(cmd: C, input: $Commands.Input<C>, type: number): Promise<$Commands.Output<C, $A2BCommands>> {

    const zerocopybuffer_list: ArrayBufferView[] = [];
    const transferable_metadata: number[] = [];
    let z_acc_id = 0;
    // 处理 buffer view
    const copy_list = input.map((value, index) => {
      if (ArrayBuffer.isView(value)) {
        console.log("deno#zerocopybuffer_list:", index, value)
        zerocopybuffer_list.push(value);
        transferable_metadata.push(index, z_acc_id++);
        return z_acc_id;
      }
      return value;
    });


    this.postMessageToKotlin(this.reqId, cmd, type, JSON.stringify(copy_list), zerocopybuffer_list, transferable_metadata);
    /// op( sendzerocopybuffer , zerocopybuffer, id) ✅
    /// kotin_map.set(id,zerocopybytes)✅
    ///
    /// op(send , version:number, cmd:string, reqId:number, type:number, data:string, transferable_metadata:number[])✅
    ///
    /// JAVA_send()
    ///     const cmd = [version,cmd,reqId,type, JSON.parse(data).map((value,index)=>transferable_metadata.getKey(index) ?.let{ kotin_map.getAndDelete() } ?? value ) ] ✅
    /// registry('dweb-channel',({xxx}))
    /// registry('open-dwebview',({xxx})=>{  deno.call('send', )  })
    return await REQ_CATCH.forceGet(this.reqId).po.promise
  }

  postMessageToKotlin(
    req_id: Uint16Array,
    cmd: $Commands.Cmd,
    type: number,
    data_string: string,
    zerocopybuffer_list: ArrayBufferView[],
    transferable_metadata: number[]) {
    console.log("🚓cmd--> %s,req_id: %s, data_string:%s", cmd, req_id, data_string)
    // 发送bufferview
    if (zerocopybuffer_list.length !== 0) {
      zerocopybuffer_list.forEach((zerocopybuffer) => {
        console.log("deno#zerocopybuffer,req_id: %s, zerocopybuffer: %s", req_id, zerocopybuffer)
        send_zero_copy_buffer(req_id, zerocopybuffer);
      })
    }
    // 发送具体操作消息
    this.callFunction(cmd, type, data_string, transferable_metadata)
  }

  dwebviewResponse() {
    // dwebview.onRequest((req,res)=>{
    /// 1
    // res.send(data)
    // res.end(data)

    /// 2
    // this.post('dweb-channel',[dwebview.channelId, dwebview.boxReponseChunk( req.id,isEnd,orderId,data) ]);

    /// 3 kotlin
    // registry('dweb-channel',
    //   (channleId,chunk)=>{
    //     const channel = getChannale(channleId)
    //     channel.postData(chunk)
    //   }
    // )

    /// 4 service-worker
    // channel.onMessage((message)=>{
    //   const [reqId,isEnd, data] = open(message);
    //   reqresMap.get(reqId)
    //     .bodyStream.enquene(data)
    //     ..isEnd?close()
    // })
    // })
  }

  headViewAdd() {
    this.reqId[0]++;
    
  }


  /**
   * 调用deno的函数
   * @param handleFn
   * @param data
   */
  callFunction(handleFn: string, type: number, data = "''", transferable_metadata: number[]) {
    this.headViewAdd();
    const body = this.structureBinary(handleFn, type, data, transferable_metadata);
    // 发送消息
    js_to_rust_buffer(body); // android - denoOp
  }

  /**
   * 循环获取kotlin system 返回的数据
   * @returns 
   */
  async loopGetKotlinReturn() {
    do {
      const result = await getRustBuffer(this.reqId); // backSystemDataToRust
      // console.log(`asyncCallDenoFunction：🚑,当前请求的：${this.reqId[0]},是否存在请求：${REQ_CATCH.has(this.reqId)}`);
      if (result.done) {
        continue;
        // if (RUST_DATA_CATCH.tryHas(headView)) {
        //   // 拿到缓存里的
        //   const value = RUST_DATA_CATCH.forceGet(headView)!;
        //   RUST_DATA_CATCH.tryDelete(headView);
        //   // console.log("asyncCallDenoFunction：11😄缓存里拿的：", headView[0])
        //   return value;
        // }
      }

      // console.log(`asyncCallDenoFunction：🚑,当前请求的：${this.reqId[0]},是否存在请求：${REQ_CATCH.has(this.reqId)}`);

      if (REQ_CATCH.has(this.reqId)) {
        REQ_CATCH.get(this.reqId)?.po.resolve(result.value);
        REQ_CATCH.delete(this.reqId)
      }

      // // 如果请求是返回了是同一个表示头则返回成功
      // if (headView[0] === result.headView[0]) {
      //   // console.log("asyncCallDenoFunction：1😃拿到请求：", headView[0])
      //   return result.value;
      // }

      // // 如果需要的跟请求返回的不同 先看缓存里有没有
      // if (RUST_DATA_CATCH.tryHas(headView)) {
      //   // 拿到缓存里的
      //   const value = RUST_DATA_CATCH.forceGet(headView)!;
      //   RUST_DATA_CATCH.tryDelete(headView);
      //   // 如果是拿缓存里的，并且本次有返回，需要存起来
      //   if (result.value) {
      //     RUST_DATA_CATCH.trySet(result.headView, result.value);
      //   }
      //   // console.log("asyncCallDenoFunction：1😄缓存里拿的：", headView[0])
      //   return value;
      // }
      // console.log("asyncCallDenoFunction：1😃未命中,存储请求：", result.headView[0], RUST_DATA_CATCH.tryHas(headView))
      // 如果不存在，则先存起来
      // RUST_DATA_CATCH.trySet(result.headView, result.value);
    } while (true);
  }

  /** 针对64位
   * 第一块分区：版本号 2^8 8位，一个字节 1：表示消息，2：表示广播，4：心跳检测
   * 第二块分区：头部标记 2^16 16位 两个字节  根据版本号这里各有不同，假如是消息，就是0，1；如果是广播则是组
   * 第三块分区：数据主体 动态创建
   */
  structureBinary(fn: string, type: number, data = "", transferable_metadata: number[]) {
    // op(send , version:number, cmd:string, reqId:number, type:number, data:string, transferable_metadata:number[])
    const message = `{"cmd":"${fn}","type":${type},"data":${data},"transferable_metadata":[${transferable_metadata.join()}]}`;

    // 字符 转 Uint16Array
    const body = stringToByte(message);

    return contactUint16(this.version_id, this.reqId, body);
  }

  /**
   * 拼接Uint8Array
   * @param arrays Uint8Array[]
   * @returns Uint8Array
   */
  concatenate(...arrays: Uint8Array[]) {
    let totalLength = 0;
    for (const arr of arrays) {
      totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
}

export const deno = new Deno();

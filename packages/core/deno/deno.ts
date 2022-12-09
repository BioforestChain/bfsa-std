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

  postMessageToKotlin(req_id: Uint16Array, cmd: $Commands.Cmd, type: number,
    data_string: string, zerocopybuffer_list: ArrayBufferView[], transferable_metadata: number[]) {

    this.headViewAdd();

    console.log("🚓cmd--> %s,req_id: %s, data_string:%s", cmd, req_id, data_string)
    // 发送bufferview
    if (zerocopybuffer_list.length !== 0) {
      zerocopybuffer_list.map((zerocopybuffer) => {
        console.log("deno#op_send_zero_copy_buffer1", req_id)
        send_zero_copy_buffer(req_id, zerocopybuffer);
        console.log("deno#op_send_zero_copy_buffer3", req_id)
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
      if (result.done) {
        continue;
      }
      console.log(`deno#loopGetKotlinReturn,当前请求的：${this.reqId[0]},是否存在请求：${REQ_CATCH.has(this.reqId)}`);
        REQ_CATCH.get(this.reqId)?.po.resolve(result.value);
        REQ_CATCH.delete(this.reqId)
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
}

export const deno = new Deno();

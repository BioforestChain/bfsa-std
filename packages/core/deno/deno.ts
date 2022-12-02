/////////////////////////////
/// 这里封装调用deno的方法，然后暴露出去
/////////////////////////////

import { send_zero_copy_buffer, js_to_rust_buffer } from "./rust.op.ts";
import { currentPlatform } from "../runtime/platform.ts";
import { stringToByte } from "../../util/binary.ts";
import { PromiseOut } from 'https://deno.land/x/bnqkl_util@1.1.2/packages/extends-promise-out/PromiseOut.ts';
import { netCallNativeService } from "../jscore/swift.op.ts";
import { contactUint16 } from "../../util/binary.ts";
import { $A2BCommands, $Commands, Transform_Type } from "./cmd.ts";

let z_acc_id = 0;
type $TCmd = $Commands.Output<$Commands.Cmd,$A2BCommands>;
class Deno {
  version_id = new Uint16Array([1]);
  reqId = new Uint16Array([0]); // 初始化头部标记
  reqMap :Map<Uint16Array,PromiseOut<$TCmd>> = new Map();

  
  set(req_id:Uint16Array,promiseOut:PromiseOut<$TCmd>) : PromiseOut<$TCmd> {
    this.reqMap.set(req_id,promiseOut)
    return promiseOut
  }
  

  async request<C extends $Commands.Cmd>(cmd: C, input: $Commands.Input<C>): Promise<$Commands.Output<C,$A2BCommands>> {
    //
    const zerocopybuffer_list: ArrayBufferView[] = [];
    const transferable_metadata: number[] = [];
    // 处理 buffer view
    const copy_list = input.map((value, index) => {
      if (ArrayBuffer.isView(value)) {
        zerocopybuffer_list.push(value);
        transferable_metadata.push(index, z_acc_id++);
        return z_acc_id;
      }
      return value;
    });
     const type: number = Transform_Type.COMMON | Transform_Type.HAS_RETURN;
        this.postMessageToKotlin(this.version_id, this.reqId,cmd, type, JSON.stringify(copy_list), zerocopybuffer_list, transferable_metadata);
        /// op( sendzerocopybuffer , zerocopybuffer, id)
        /// kotin_map.set(id,zerocopybytes)
        ///
        /// op(send , version:number, cmd:string, reqId:number, type:number, data:string, transferable_metadata:number[])
        ///
        /// JAVA_send()
        ///     const cmd = [version,cmd,reqId,type, JSON.parse(data).map((value,index)=>transferable_metadata.getKey(index) ?.let{ kotin_map.getAndDelete() } ?? value ) ]
        /// registry('dweb-channel',({xxx}))
        /// registry('open-dwebview',({xxx})=>{  deno.call('send', )  })

      return await this.set(this.reqId, new PromiseOut()).promise;
    }

    postMessageToKotlin(version_id:Uint16Array,req_id:Uint16Array,cmd:$Commands.Cmd,type:number,data_string:string,zerocopybuffer_list:ArrayBufferView[],transferable_metadata:number[]) {
        if (zerocopybuffer_list.length !== 0) {
          zerocopybuffer_list.forEach((zerocopybuffer) => {
            send_zero_copy_buffer(req_id,zerocopybuffer);
          })
        }
    }


    post(){
      // const type :number = Transform_Type.COMMON;
      // this.postMessageToKotlin(version, reqId, type, str, zerocopybuffer);
    }

    dwebviewResponse(){
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
  callFunction(handleFn: string,type:number, data = "''",transferable_metadata:number[]) {
    this.headViewAdd();
    const { body, headView } = this.structureBinary(handleFn,type, data,transferable_metadata);
    let msg = new Uint8Array();
    // 发送消息
    if (currentPlatform() === "Android") {
      js_to_rust_buffer(body); // android - denoOp
    } else {
      msg = netCallNativeService(handleFn, data); //  ios - javascriptCore
    }
    const res = { versionView: this.version_id, headView:new Uint8Array(headView.buffer), msg }
    return res;
  }
  /**
   * 调用evaljs 执行js
   * @param handleFn
   * @param data
   */
  callEvalJsStringFunction(handleFn: string, data = "''") {
    const message = `{"cmd":"${handleFn}","data":${data}}`;
    // 字符 转 Uint16Array
    const body = stringToByte(message);
    if (currentPlatform() === "Android") {
      js_to_rust_buffer(body); // android - denoOp
    } else {
      netCallNativeService(handleFn, data); //  ios - javascriptCore
    }
  }

  /** 针对64位
   * 第一块分区：版本号 2^8 8位，一个字节 1：表示消息，2：表示广播，4：心跳检测
   * 第二块分区：头部标记 2^16 16位 两个字节  根据版本号这里各有不同，假如是消息，就是0，1；如果是广播则是组
   * 第三块分区：数据主体 动态创建
   */
  structureBinary(fn: string,type:number, data = "",transferable_metadata:number[]) {
    // op(send , version:number, cmd:string, reqId:number, type:number, data:string, transferable_metadata:number[])
    const message = `{"cmd":"${fn}","type":${type},"data":${data},"transferable_metadata":[${transferable_metadata.join()}]}`;

    // 字符 转 Uint16Array
    const body = stringToByte(message);

    return {
      body: contactUint16(this.version_id, this.reqId, body),
      headView: this.reqId,
    };
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

export default new Deno();

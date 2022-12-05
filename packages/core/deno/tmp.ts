// class test {
//     request<C extends $Commands.Cmd>(cmd: C, input: $Commands.Input<C>): $Commands.Output<C> {
//         ///
//         const zerocopybuffer_list: ArrayBufferView[] = [];
//         const transferable_metadata: number[] = [];
    
//         let acc_id = 0;
//         const copy_list = input.map((value, index) => {
//           if (ArrayBuffer.isView(value)) {
//             const id = acc_id++;
//             zerocopybuffer_list.push(value);
//             transferable_metadata.push(index, z_acc_id++);
//             return z_acc_id;
//           }
//           return value;
//         });
    
//         let L = 0;
//         enum Transform_Type {
//           HAS_RETURN = 1 >> L++,
    
//           COMMON = 1 >> L++,
//           // IS_ALL_BUFFER = 1 >> L++,
//           // IS_ALL_JSON = 1 >> L++,
//           // IS_ALL_STRING = 1 >> L++,
//           // IS_ALL_U32 = 1 >> L++,
//           // IS_ALL_BOOLEAN = 1 >> L++,
//         }
    
//         const type: number = Transform_Type.COMMON | Transform_Type.HAS_RETURN;
    
//           this.postMessageToKotlin(version, reqId,cmd, type, JSON.stringify(copy_list), zerocopybuffer_list, transferable_metadata);
//             /// op( sendzerocopybuffer , zerocopybuffer, id)
//             /// kotin_map.set(id,zerocopybytes)
//             ///
//             /// op(send , version:number, cmd:string, reqId:number, type:number, data:string, transferable_metadata:number[])
//             ///
//             /// JAVA_send()
//             ///     const cmd = [version,cmd,reqId,type, JSON.parse(data).map((value,index)=>transferable_metadata.getKey(index) ?.let{ kotin_map.getAndDelete() } ?? value ) ]
//             /// registry('dweb-channel',({xxx}))
//             /// registry('open-dwebview',({xxx})=>{  deno.call('send', )  })
    
//           return this.reqMap.set(reqId, new PromiseOut()).promise;
//         }
//         post(){
//           const type :number = Transform_Type.COMMON;
//           this.postMessageToKotlin(version, reqId, type, str, zerocopybuffer);
//         }
    
//         dwebviewResponse(){
//           dwebview.onRequest((req,res)=>{
//             /// 1
//             res.send(data)
//             res.end(data)
    
//             /// 2
//             this.post('dweb-channel',[dwebview.channelId, dwebview.boxReponseChunk( req.id,isEnd,orderId,data) ]);
    
//             /// 3 kotlin
//             registry('dweb-channel',
//               (channleId,chunk)=>{
//                 const channel = getChannale(channleId)
//                 channel.postData(chunk)
//               }
//             )
    
//             /// 4 service-worker
//             channel.onMessage((message)=>{
//               const [reqId,isEnd, data] = open(message);
//               reqresMap.get(reqId)
//                 .bodyStream.enquene(data)
//                 ..isEnd?close()
//             })
//           })
//       }
// }



// kotlin
// class SimpleIOArray{
//   (json_data,kotin_map){

//   }

//   getStringByIndex(index:number):String{
//   }
//   getStringByIndexOptions(index:number):String?{
//   }

//   getIntByIndex(index:number){
//   }
//   getBooleanByIndex(index:number){
//   }
//   getBytesByIndex(index:number){
//   }
// }

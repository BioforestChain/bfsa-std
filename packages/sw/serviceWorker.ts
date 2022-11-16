/// <reference lib="webworker" />

import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-promise-out/PromiseOut.ts";
import { EasyMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyMap.ts";
import { EasyWeakMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyWeakMap.ts";

((self: ServiceWorkerGlobalScope) => {

  const CLIENT_FETCH_CHANNEL_ID_WM = EasyWeakMap.from({
    creater(_client: Client) {
      return registerChannel()
    }
  });


  self.addEventListener("install", () => {
    // 跳过等待
    self.skipWaiting()
  });

  self.addEventListener("activate", () => {
    // 立刻控制整个页面
    self.clients.claim()
  });

  const event_id_acc = new Uint16Array(1);
  const EVENT_ID_WM = EasyWeakMap.from({
    // deno-lint-ignore no-unused-vars
    creater(event: FetchEvent) {
      return event_id_acc[0] += 2;
    }
  })


  const FETCH_EVENT_TASK_MAP = EasyMap.from({
    transformKey(key: { event: FetchEvent, channelId: string }) {
      return key.channelId + "-" + EVENT_ID_WM.forceGet(key.event)
    },
    creater(key) {
      let bodyStreamController: ReadableStreamController<ArrayBuffer>;
      const bodyStream = new ReadableStream<ArrayBuffer>({
        start(controller) {
          bodyStreamController = controller
        }
      });
      const reqId = EVENT_ID_WM.forceGet(key.event)
      return {
        reqHeadersId: reqId,
        reqBodyId: reqId + 1,
        channelId: key.channelId,
        po: new PromiseOut<Response>(),
        responseHeaders: {},
        responseStatusCode: 200,
        responseBody: { stream: bodyStream, controller: bodyStreamController! }
      }
    }
  })

  // remember event.respondWith must sync call🐰
  self.addEventListener("fetch", (event) => {

    const request = event.request;
    const path = new URL(request.url).pathname
    // 资源文件不处理
    if (path.lastIndexOf(".") !== -1) {
      return
    }
    /// 开始向外发送数据，切片发送
    console.log(`HttpRequestBuilder ${request.method},url: ${request.url}`)

    event.respondWith((async () => {
      const client = await self.clients.get(event.clientId)
      if (client === undefined) {
        return fetch(event.request)
      }
      const channelId = await CLIENT_FETCH_CHANNEL_ID_WM.forceGet(client)
      const task = FETCH_EVENT_TASK_MAP.forceGet({ event, channelId });

      // Build chunks
      const chunks = new HttpRequestBuilder(
        task.reqHeadersId,
        task.reqBodyId,
        request
      );

      // 迭代发送
      for await (const chunk of chunks) {
        fetch(`/channel/${channelId}/chunk=${chunk}`)
          .then(res => res.text(), _ => ({ success: false }));
      }
      return await task.po.promise
    })())
  });


  class HttpRequestBuilder {
    constructor(
      readonly headersId: number,
      readonly bodyId: number,
      readonly request: Request,
    ) { }

    async *[Symbol.asyncIterator]() {
      const { request, headersId, bodyId } = this
      // console.log("headerId:", headersId, "bodyId:", bodyId)
      const headers: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        if (key === "user-agent") { // user-agent 太长了先不要
          return
        }
        Object.assign(headers, { [key]: value })
      })
      // 传递headers
      yield contactToHex(
        uint16_to_binary(headersId),
        encoder.encode(JSON.stringify({ url: request.url, headers, method: request.method.toUpperCase() })),
        uint8_to_binary(0)
      );
      const buffer = await request.blob()
      // console.log("有body数据传递1", request.method, buffer);
      const body = buffer.stream()
      // 如果body为空
      if (body) {
        // deno-lint-ignore no-explicit-any
        const reader = (body as any).getReader();
        do {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          // console.log("有body数据传递2：", value)
          yield binaryToHex(contact(uint16_to_binary(bodyId), value, uint8_to_binary(0)));
        } while (true)
      }
      yield binaryToHex(contact(uint16_to_binary(bodyId), uint8_to_binary(1)));
    }
  }

  // return data 🐯
  self.addEventListener('message', event => {
    if (typeof event.data !== 'string') return
    const data = JSON.parse(event.data);
    const returnId: number = data.returnId;
    const channelId: string = data.channelId;
    const chunk = hexToBinary(data.chunk);
    const end = chunk.subarray(-1)[0] === 1;
    const bodyId = returnId | 1;
    const headersId = bodyId - 1;

    console.log(`serviceWorker chunk=> ${chunk},end:${end}`);
    const fetchTask = FETCH_EVENT_TASK_MAP.get(`${channelId}-${headersId}`);
    // 如果存在
    if (fetchTask === undefined) {
      throw new Error("no found fetch task:" + returnId)
    }
    const responseContent = chunk.slice(0, -1);
    if (returnId === headersId) { // parse headers
      console.log("responseContent:", decoder.decode(responseContent))
      const { statusCode, headers } = JSON.parse(decoder.decode(responseContent))
      fetchTask.responseHeaders = headers;
      fetchTask.responseStatusCode = statusCode;
      fetchTask.po.resolve(new Response(fetchTask.responseBody.stream, {
        status: statusCode,
        headers,
      }))
    } else if (returnId === bodyId) { // parse body
      console.log("文件流推入", channelId, headersId, bodyId, responseContent.byteLength);
      fetchTask.responseBody.controller.enqueue(responseContent)
    } else {
      throw new Error("should not happen!! NAN? " + returnId)
    }
    if (end) {
      console.log("文件流关闭", channelId, headersId, bodyId);
      fetchTask.responseBody.controller.close();
    }
  })

  /**
   *  创建ReadableStream
   * @param arrayBuffer 
   * @param chunkSize 64 kib
   * @returns 
   */
  // deno-lint-ignore no-unused-vars
  function createReadableStream(arrayBuffer: ArrayBuffer, chunkSize = 64 * 1024) {
    if (arrayBuffer.byteLength === 0) return null
    return new ReadableStream({
      start(controller) {
        const bytes = new Uint8Array(arrayBuffer)
        for (let readIndex = 0; readIndex < bytes.byteLength;) {
          controller.enqueue(bytes.subarray(readIndex, readIndex += chunkSize))
        }
        controller.close()
      }
    });
  }



  const contact = (...arrs: Uint8Array[]) => {
    const length = arrs.reduce((l, a) => l += a.length, 0);
    const r = new Uint8Array(length);
    let walk = 0
    for (const arr of arrs) {
      r.set(arr, walk)
      walk += arr.length
    }
    return r
  }
  const contactToHex = (...arrs: Uint8Array[]) => {
    const hexs = []
    for (const arr of arrs) {
      hexs.push(binaryToHex(arr))
    }
    return hexs.join(",")
  }

  const uint16_to_binary = (num: number) => {
    const r = new Uint16Array([num]);
    return new Uint8Array(r.buffer)
  }
  const uint8_to_binary = (num: number) => {
    return new Uint8Array([num]);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const binaryToHex = (binary: Uint8Array) => {
    // let hex = '';
    // for (const byte of binary) {
    //   hex+= byte.toString()
    // }
    return binary.join()
  }
  const hexToBinary = (hex: string) => {
    return new Uint8Array(hex.split(",").map(v => +v))
  }
  // function hexEncode(data: string) {
  //   return encoder.encode(data);
  // }

  // function hexDecode(buffer: ArrayBuffer) {
  //   return new TextDecoder().decode(new Uint8Array(buffer));
  // }

  // 向native层申请channelId
  async function registerChannel() {
    return await fetch(`/channel/registry`).then(res => res.text())
  }

})(self as never);

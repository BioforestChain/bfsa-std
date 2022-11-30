/// <reference lib="webworker" />

import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-promise-out/PromiseOut.ts";
import { EasyMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyMap.ts";
import { EasyWeakMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyWeakMap.ts";
import { Channels, matchOpenChannel, matchBackPressureOpen, matchCommand } from "./Channel.ts";
import { binaryToHex, contactUint16, contactToHex, hexToBinary, uint16_to_binary, stringToByte, bufferToString }
  from "../util/binary.ts";

((self: ServiceWorkerGlobalScope) => {

  const CLIENT_FETCH_CHANNEL_ID_WM = EasyWeakMap.from({
    creater(_client: Client) {
      return registerChannel();
    },
  });

  self.addEventListener("install", () => {
    // 跳过等待
    return self.skipWaiting();
  });

  self.addEventListener("activate", () => {
    // 卸载所有 Service Worker
    self.registration.unregister();
    // 立刻控制整个页面
    return self.clients.claim();
  });

  const event_id_acc = new Uint16Array(1);
  const EVENT_ID_WM = EasyWeakMap.from({
    // deno-lint-ignore no-unused-vars
    creater(event: FetchEvent) {
      return event_id_acc[0] += 2;
    },
  });

  const FETCH_EVENT_TASK_MAP = EasyMap.from({
    transformKey(key: { event: FetchEvent; channelId: string }) {
      return key.channelId + "-" + EVENT_ID_WM.forceGet(key.event);
    },
    creater(key) {
      let bodyStreamController: ReadableStreamController<ArrayBuffer>;
      const bodyStream = new ReadableStream<ArrayBuffer>({
        start(controller) {
          bodyStreamController = controller;
        },
      });
      const reqId = EVENT_ID_WM.forceGet(key.event);
      return {
        reqHeadersId: reqId,
        reqBodyId: reqId + 1,
        channelId: key.channelId,
        po: new PromiseOut<Response>(),
        responseHeaders: {},
        responseStatusCode: 200,
        responseBody: { stream: bodyStream, controller: bodyStreamController! },
      };
    },
  });

  let back_pressure: PromiseOut<void> | undefined;
  type TQFetch = {
    url: string;
    task: PromiseOut<Response>;
  };
  const url_queue: TQFetch[] = [];
  let running = false;
  const queueFetch = async (url: string) => {
    const task = new PromiseOut<Response>();
    url_queue.push({ url, task });
    await _runFetch();
    return task.promise;
  };
  const _runFetch = async () => {
    if (running) return;
    running = true;
    while (true) {
      const item = url_queue.shift();
      if (item === undefined) {
        break;
      }
      if (back_pressure) {
        console.log("back_pressure", back_pressure);
        // await back_pressure.promise
      }
      await fetch(item.url).then(async (res) => {
        const { success } = await res.json();
        if (success === true) {
          back_pressure = new PromiseOut();
        }
        item.task.resolve(res);
      }).catch((err) => {
        throw new Error(err);
      });
    }
    running = false;
  };
  const channels: Channels[] = []; // 后端创建的channel通道

  // remember event.respondWith must sync call🐰
  self.addEventListener("fetch", (event) => {
    const request = event.request;
    const path = new URL(request.url).pathname;
    // 资源文件不处理
    if (path.lastIndexOf(".") !== -1) {
      return;
    }

    for (const channel of channels) {
      const matchResult = channel.match(request); // 放行系统的，拦截配置的
      console.log("matchResult:", matchResult);
      if (matchResult) {
        event.respondWith(channel.handler(request)); // 看看是否匹配了channel通道
      }
    }
    /// 开始向外发送数据，切片发送
    console.log(`HttpRequestBuilder ${request.method},url: ${request.url}`);

    event.respondWith((async () => {
      const client = await self.clients.get(event.clientId);
      if (client === undefined) {
        return fetch(event.request);
      }

      const channelId = await CLIENT_FETCH_CHANNEL_ID_WM.forceGet(client);
      const task = FETCH_EVENT_TASK_MAP.forceGet({ event, channelId });

      // Build chunks
      const chunks = new HttpRequestBuilder(
        task.reqHeadersId,
        task.reqBodyId,
        request,
      );
      // 迭代发送
      for await (const chunk of chunks) {
        queueFetch(`/channel/${channelId}/chunk=${chunk}`);
      }
      return await task.po.promise;
    })());
  });

  // return data 🐯
  self.addEventListener("message", (event) => {
    if (typeof event.data !== "string") return;
    // 如果是cmd命令
    if (matchCommand(event.data)) {
      // 匹配后端打开背压的命令
      if (matchBackPressureOpen(event.data)) {
        console.log(`matchBackPressureOpen 😺}`);
        back_pressure?.resolve();
        return true;
      }
      // 匹配后端创建一个channel 线程的命令
      const data = matchOpenChannel(event.data);
      if (data) {
        console.log(`matchOpenChannel 🤠-->${JSON.stringify(data)}`);
        channels.push(data); // { type: "pattern", url:"" }
        return true;
      }
      return data;
    }

    const data = JSON.parse(event.data);
    const returnId: number = data.returnId;
    const channelId: string = data.channelId;
    const chunk = hexToBinary(data.chunk);
    const end = chunk.slice(-1)[0] === 1;
    const bodyId = returnId | 1;
    const headersId = bodyId - 1;

    console.log(`serviceWorker chunk=> ${chunk},end:${end}`);
    const fetchTask = FETCH_EVENT_TASK_MAP.get(`${channelId}-${headersId}`);

    // 如果存在
    if (fetchTask === undefined) {
      throw new Error("no found fetch task:" + returnId);
    }
    const responseContent = chunk.slice(0, -1);

    if (returnId === headersId) { // parse headers
      console.log("responseContent:", bufferToString(responseContent));
      const { statusCode, headers } = JSON.parse(bufferToString(responseContent));
      fetchTask.responseHeaders = headers;
      fetchTask.responseStatusCode = statusCode;
      fetchTask.po.resolve(
        new Response(fetchTask.responseBody.stream, {
          status: statusCode,
          headers,
        }),
      );
    } else if (returnId === bodyId) { // parse body
      console.log("文件流推入", channelId, headersId, bodyId, responseContent.length);
      fetchTask.responseBody.controller.enqueue(new Uint8Array(responseContent));
    } else {
      throw new Error("should not happen!! NAN? " + returnId);
    }

    if (end) {
      console.log("文件流关闭", channelId, headersId, bodyId);
      fetchTask.responseBody.controller.close();
    }
  });

  class HttpRequestBuilder {
    constructor(
      readonly headersId: number,
      readonly bodyId: number,
      readonly request: Request,
    ) { }

    async *[Symbol.asyncIterator]() {
      const { request, headersId, bodyId } = this;
      // console.log("headerId:", headersId, "bodyId:", bodyId)
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (key === "user-agent") { // user-agent 太长了先不要
          return;
        }
        Object.assign(headers, { [key]: value });
      });
      // 传递headers
      yield contactToHex(
        uint16_to_binary(headersId),
        stringToByte(JSON.stringify({ url: request.url, headers, method: request.method.toUpperCase() })),
        uint16_to_binary(0),
      );
      const buffer = await request.blob();
      // console.log("有body数据传递1", request.method, buffer);
      const body = buffer.stream();
      // 如果body为空
      if (body) {
        // deno-lint-ignore no-explicit-any
        const reader = (body as any).getReader();
        do {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          // console.log("有body数据传递2：", value)
          yield binaryToHex(contactUint16(uint16_to_binary(bodyId), value, uint16_to_binary(0)));
        } while (true);
      }
      yield binaryToHex(contactUint16(uint16_to_binary(bodyId), uint16_to_binary(1)));
    }
  }

  // 向native层申请channelId
  async function registerChannel() {
    return await fetch(`/channel/registry`).then((res) => res.text());
  }
})(self as never);

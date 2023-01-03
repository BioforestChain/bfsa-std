/// <reference lib="webworker" />

import { EasyMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyMap.ts";
import { EasyWeakMap } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-map/EasyWeakMap.ts";
import { PromiseOut } from "https://deno.land/x/bnqkl_util@1.1.1/packages/extends-promise-out/PromiseOut.ts";
import { bufferToString, contactNumber, hexToBinary, stringToNum } from "../util/binary.ts";
import { Channels, matchBackPressureOpen, matchCommand, matchOpenChannel, matchOpenMsgChannel, registerChannelId, TCmd } from "./Channel.ts";


((self: ServiceWorkerGlobalScope) => {
  let isIos = false;
  let msgPost: MessagePort // messagePort
  const msgPoop = new PromiseOut<MessagePort>() // 等待messagePort创建

  const channelIdOp = new PromiseOut<string>()

  const CLIENT_FETCH_CHANNEL_ID_WM = EasyWeakMap.from({
    creater(_client: Client) {
      return registerChannel();
    },
  });

  self.addEventListener("install", (event) => {
    // 跳过等待
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener("activate", (event) => {
    // 立刻控制整个页面
    event.waitUntil(self.clients.claim()); // Become available to all pages
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
      let bodyStreamController: ReadableStreamController<ArrayBufferView>;
      const bodyStream = new ReadableStream<ArrayBufferView>({
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


  // let back_pressure: PromiseOut<void> | undefined;
  type TQFetch = {
    url: string;
    task: PromiseOut<Response | string>;
  };
  const url_queue: TQFetch[] = [];
  let running = false;
  const queueFetch = async (url: string) => {
    const task = new PromiseOut<Response | string>();
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
      // if (back_pressure) {
      // await back_pressure.promise
      // }
      await fetch(item.url).then(async (res) => {
        const { success } = await res.json();
        // if (success === true) {
        // back_pressure = new PromiseOut();
        // }
        item.task.resolve(success);
      }).catch((err) => {
        console.error(err)
      });

      running = false;
    }
  }
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
      console.log(`serviceWorker#matchResult: ${matchResult}`);
      if (matchResult) {
        return event.respondWith(channel.handler(request)); // 看看是否匹配了channel通道
      }
    }
    /// 开始向外发送数据，切片发送
    // console.log(`serviceWorker#HttpRequestBuilder ${request.method},url: ${request.url}`);

    event.respondWith((async () => {
      const client = await self.clients.get(event.clientId);

      if (client === undefined) {
        return fetch(event.request);
      }
      const channelId = await CLIENT_FETCH_CHANNEL_ID_WM.forceGet(client);
      const task = FETCH_EVENT_TASK_MAP.forceGet({ event, channelId });

      // date.set(channelId, new Date().getTime());
      // _post.postMessage(`🥕channelId:${channelId} 发送时间：${date.get(channelId)}`)

      // Build chunks
      const chunks = new HttpRequestBuilder(
        task.reqHeadersId,
        task.reqBodyId,
        request,
      );
      if (isIos) {
        msgPost = await msgPoop.promise // 等待msg port 创建
      }
      // 迭代发送
      for await (const chunk of chunks) {
        if (isIos) {
          msgPost.postMessage("ios#getConnectChannel 发送")
          msgPost.postMessage({
            url: `/channel/${channelId}/chunk=${chunk}`
          })
        } else {
          queueFetch(`/channel/${channelId}/chunk=${chunk}`);
        }
      }
      return await task.po.promise;
    })());
  });

  // return data 🐯
  self.addEventListener("message", (event) => {
    if (typeof event.data !== "string") return;
    // 如果是cmd命令
    const cmd = matchCommand(event.data);
    if (cmd) {
      matchMsgCommand(event, cmd)
      return false;
    }

    const data = JSON.parse(event.data);
    const returnId: number = data.returnId; // 拿到body/hard Id
    const channelId: string = data.channelId;
    const chunk = hexToBinary(data.chunk); // 拿到请求体
    const end = chunk.slice(-1)[0] === 1; // 拿到是否结束的标记
    const bodyId = returnId | 1;
    const headersId = bodyId - 1;

    if (isIos) {
      console.log("isIos:", isIos)
      msgPost.postMessage(`serviceWorker#end:${end},bodyId:${bodyId},headersId:${channelId}-${headersId}`);
    } else {
      console.log(`serviceWorker#end:${end},bodyId:${bodyId},headersId:${channelId}-${headersId}`)
    }
    const fetchTask = FETCH_EVENT_TASK_MAP.get(`${channelId}-${headersId}`);

    // 如果不存在
    if (fetchTask === undefined) {
      throw new Error("no found fetch task:" + returnId);
    }
    const responseContent = chunk.slice(0, -1);

    if (returnId === headersId) { // parse headers
      // _post.postMessage("serviceWorker#responseContent:", bufferToString(responseContent));
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
      if (isIos) {
        msgPost.postMessage(`serviceWorker#文件流推入:${channelId},${bodyId}`);
      } else {
        console.log(`serviceWorker#文件流推入:${channelId},${bodyId}`)
      }
      fetchTask.responseBody.controller.enqueue(new Uint8Array(responseContent))
    } else {
      throw new Error("should not happen!! NAN? " + returnId);
    }

    if (end) {
      if (isIos) {
        msgPost.postMessage(`serviceWorker#文件流关闭${channelId},${headersId},${bodyId}`);
      } else {
        console.log(`serviceWorker#文件流关闭${channelId},${headersId},${bodyId}`);
      }
      fetchTask.responseBody.controller.close();
    }

  });
  /**
   * 匹配后端的事件命令
   * @param event 
   * @param cmd 
   * @returns 
   */
  function matchMsgCommand(event: ExtendableMessageEvent, cmd: TCmd) {
    // 申请注册到了一个channelId
    if (registerChannelId(cmd)) {
      console.log("serviceWorker#接收到了channelId:", cmd.data, cmd.cmd)
      channelIdOp.resolve(cmd.data)
    }
     console.log("serviceWorker#matchOpenMsgChannel:", JSON.stringify(cmd))
    // 打开一个channelMessagePort 用于传递ios消息
    if (matchOpenMsgChannel(cmd)) {
      msgPost = event.ports[0]
      msgPoop.resolve(msgPost)
      isIos = cmd.data
      msgPost.postMessage("这条消息来自service Worker Message: " + JSON.stringify(cmd));
      return true;
    }
    // 匹配后端打开背压的命令
    if (matchBackPressureOpen(cmd)) {
      console.log(`serviceWorker#matchBackPressureOpen 😺}`);
      // back_pressure?.resolve();
      return true;
    }
    // 匹配后端创建一个channel 线程的命令
    const openChannelCmd = matchOpenChannel(cmd);
    if (openChannelCmd) {
      console.log(`serviceWorker#matchOpenChannel 🤠-->${JSON.stringify(openChannelCmd)}`);
      channels.push(new Channels(openChannelCmd.data)); // { type: "pattern", url:"" }
      return true;
    }
  }

  class HttpRequestBuilder {
    constructor(
      readonly headersId: number,
      readonly bodyId: number,
      readonly request: Request,
    ) { }

    async *[Symbol.asyncIterator]() {
      const { request, headersId, bodyId } = this;
      // _post.postMessage("headerId:", headersId, "bodyId:", bodyId)
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (key === "user-agent") { // user-agent 太长了先不要
          return;
        }
        Object.assign(headers, { [key]: value });
      });
      // 传递headers
      yield contactNumber(
        [headersId],
        stringToNum(JSON.stringify({ url: request.url, headers, method: request.method.toUpperCase() })),
        [0],
      );
      const buffer = await request.blob();
      // _post.postMessage("有body数据传递1", request.method, buffer.size);
      // 如果body为空
      if (buffer.size !== 0) {
        const body = buffer.stream();

        // deno-lint-ignore no-explicit-any
        const reader = (body as any).getReader();
        do {
          const { done, value } = await reader.read();
          if (done) {
            yield contactNumber([bodyId], [1]); // 最后一位拼接1，表示传递数据已经结束
            break;
          }
          // _post.postMessage("有body数据传递2：", value, bodyId)
          yield contactNumber([bodyId], hexToBinary(value.join()), [0]);
        } while (true);
      }
    }
  }


  // 向native层申请channelId
  function registerChannel() {
   if (isIos) {
    msgPost.postMessage("ios 申请channelId")
    msgPost.postMessage({
      url: `/chunk/registryChannelId`
    })
   } else {
    fetch(`/chunk/registryChannelId`)
   }
    return channelIdOp.promise
  }

})(self as never);

/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope;
let channelId = "";

sw.addEventListener("install", (event) => {
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

const FETCH_EVENT_MAP = new Map<string,
  {
    // event: FetchEvent,
    // response: Response,
    responseStream: ReadableStream,
    responseStreamController: ReadableStreamController<ArrayBuffer>
  }>()

// remember event.respondWith must sync call🐰
sw.addEventListener("fetch", (event) => {
  event.waitUntil((async () => {
    await new Promise(cb => setTimeout(cb, 1000))
  }));
  const request = event.request.clone();

  const path = new URL(request.url).pathname

  // 资源文件不处理
  if (path.lastIndexOf(".") !== -1) {
    return
  }

  let responseStreamController: ReadableStreamController<ArrayBuffer>;
  const responseStream = new ReadableStream({
    start(controller) {
      responseStreamController = controller
    }
  });

  // 生成结构体
  const fetchTask = {
    // event: event,
    // response: new Response(responseStream),
    responseStream,
    responseStreamController: responseStreamController!,
  }
  // 存起来
  FETCH_EVENT_MAP.set(String(channelId), fetchTask);

  handleRequest(request)
});



async function handleRequest(request: Request) {
  console.log("channelId1", channelId)
  // 如果id为空需要申请id
  if (channelId === "") {
    channelId = await registerChannel()
  }
  console.log(`HttpRequestBuilder ${request.method},url: ${request.url}`)
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    if (key === "user-agent") { // user-agent 太长了先不要
      return
    }
    Object.assign(headers, { [key]: value })
  })
  // 填充body
  const arrayBuffer = await request.arrayBuffer();
  console.log("arrayBuffer.byteLength:", arrayBuffer.byteLength)
  const body = createReadableStream(arrayBuffer)

  // Build chunks
  const chunks = new HttpRequestBuilder(
    request,
    request.method,
    request.url,
    headers,
    body,
    arrayBuffer.byteLength);

  // 迭代发送
  for await (const chunk of chunks) {
    const success = await fetch(`/channel/${channelId}/chunk=${chunk}`)
      .then(res => res.text(), _ => ({ success: false }));
    console.log("successxx1:", success)
  }
}



export class HttpRequestBuilder {
  static REQ_ID = new Uint16Array(1);
  static BODY_ID = new Uint16Array(1);
  static getReqId() {
    const reqId = HttpRequestBuilder.REQ_ID[0]
    HttpRequestBuilder.REQ_ID[0] += 2; // 0, 2 ,4,6
    return reqId;
  }
  static getBodyId(reqId: number) {
    const bodyId = HttpRequestBuilder.BODY_ID[0];
    HttpRequestBuilder.BODY_ID[0] = reqId + 1;// 1,3,5,7
    return bodyId;
  }
  readonly reqId = HttpRequestBuilder.getReqId()
  readonly bodyId = HttpRequestBuilder.getBodyId(this.reqId)

  constructor(
    readonly request: Request,
    readonly method: string,
    readonly url: string,
    readonly header: Record<string, string>,
    readonly body: ReadableStream<Uint8Array> | null,
    readonly bodyLength: number
  ) { }


  async *[Symbol.asyncIterator]() {
    const headerId = this.reqId;// 偶数为头
    const bodyId = this.bodyId;// 奇数为body
    console.log("headerId:", headerId, "bodyId:", bodyId, "this.body", !this.body)
    // 传递headers
    yield encodeToHex(headerId, `${this.url}|${JSON.stringify(this.header)}`);
    // 如果body为空
    if (!this.body) {
      return
    }
    const reader = this.body.getReader()
    let iterateBLen = 0;// 存储切片长度
    do {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      iterateBLen += value.byteLength;
      console.log("iterateBLen:", this.bodyLength, iterateBLen)
      if (this.bodyLength === iterateBLen) {
        yield `${bodyId.toString().padStart(4, '0')},${Array.from(new Uint8Array(value))},1` // 如果发送结束了
      } else {
        yield `${bodyId.toString().padStart(4, '0')},${Array.from(new Uint8Array(value))},0` // 发送未结束
      }

    } while (true)
  }
}

// return data 🐯
sw.addEventListener('message', event => {
  if (typeof event.data !== 'string') return
  const [channelId, end, dataHex] = String(event.data).split(':');
  const chunk = String(dataHex).split(",") as any;
  console.log(`serviceWorker chunk=> ${chunk},end:${end}`);
  const fetchTask = FETCH_EVENT_MAP.get(channelId);
  // 如果存在
  if (fetchTask) {
    console.log("如果存在:", end, hexDecode(chunk))
    // body reqId为偶数
    console.log(`填入数据=> ${chunk}`);
    fetchTask.responseStreamController.enqueue(chunk);

    console.log(`请求结束返回数据`);
    fetchTask.responseStreamController.close();
    // const data = hexDecode(chunk);
    // console.log(`请求结束返回数据=> ${data}`);
    // const [headers, status, statusText] = data.split("|");
    // console.log("解析headers", headers, status, statusText)

    // fetchTask.response = new Response(fetchTask.responseStream, { headers: {}, status: Number(status), statusText })
    // console.log("URL:", fetchTask.response.url, fetchTask.event.request.url)
    // fetchTask.event.respondWith(fetchTask.response)
  }
})

/**
 *  创建ReadableStream
 * @param arrayBuffer 
 * @param chunkSize 64 kib
 * @returns 
 */
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


function encodeToHex(reqId: number, data: string) {
  return `${reqId.toString().padStart(4, '0')},${hexEncode(data)},1`;
}

function hexEncode(data: string) {
  const encoder = new TextEncoder();
  return encoder.encode(data);
}

function hexDecode(buffer: ArrayBuffer) {
  return new TextDecoder().decode(new Uint8Array(buffer));
}

// 向native层申请channelId
async function registerChannel() {
  return await fetch(`/channel/registry`).then(res => res.text())
}



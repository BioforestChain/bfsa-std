import { IImportMap } from "../../../metadata/metadataType.ts";

import { RequestEvent } from './netHandle.ts';


// /getBlockInfo 
// [{ "url": "/getBlockInfo", "response": "https://62b94efd41bf319d22797acd.mockapi.io/bfchain/v1/getBlockInfo" }, { "url": "/getBlockHigh", "response": "https://62b94efd41bf319d22797acd.mockapi.io/bfchain/v1/getBlockInfo" }, { "url": "/app/bfchain.dev/index.html", "response": "/app/bfchain.dev/index.html" }, { "url": "/api/*", "response": "./api/*" }, { "url": "/api/upload", "response": "/api/update" }]

/**
 * 代理数据请求
 * @param path 
 * @param importMap 
 */
export async function parseNetData(event: RequestEvent, pathname: string, importMap: IImportMap[]) {
  let url = "";
  const request = event.request
  importMap.map((obj) => {
    if (obj.url.includes(pathname)) {
      url = obj.response;
      return
    }
  })
  // 如果没有在bfsa-metadata.ts里
  if (!url) {
    return url
  }

  let data = new Response()
  if (request.method.toUpperCase() === "GET") {
    //不含body
    data = await fetch(url, {
      headers: request.headers,
      method: request.method,
      mode: request.mode
    })
  } else {
    // 包含body
    data = await fetch(url, {
      headers: request.headers,
      method: request.method,
      mode: request.mode,
      body: request.body,
    })
  }
  const buffer = await data.arrayBuffer();
  event.response.write(new Uint8Array(buffer))
  event.response.end()
}



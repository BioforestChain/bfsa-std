/**
 *  判断是不是cmd命令 {"cmd":"openBackPressure"} {"cmd":"openChannel"}
 * @param data 
 * @param cmd 
 * @returns 
 */
export function matchCommand(data: string, cmd: ECommand) {
  if (!/(cmd)/.test(data)) return false
  const command = JSON.parse(data)
  if (command.cmd === cmd) {
    return true
  }
  return false
}


export enum ECommand {
  openBackPressure = "openBackPressure",
  openChannel = "openChannel" // 判断是否是打开一个Channel通道
}



export class Channels {

  constructor(
    readonly handler: ((event: Request) => Promise<Response> | undefined)
  ) { }

  async push(config: IChannelConfig) {
    // 匹配并缓存静态资源
    if (config.mode === EChannelMode.static) {
      const cache = await caches.open(config.cacheName);
      await cache.addAll(config.files);
      const handler = (request: Request) => {
        return caches.match(request).then(res => {
          if (res) return res
          return fetch(request)
        })
      }
      return new Channels(handler)
    }
    /**
     * 规则匹配 =>  api/user/*  api/admin/* 
     *            api/:method
     *            api/chunkInfo
     */
    if (config.mode === EChannelMode.pattern) {
      const url = config.url
      // api/user/*  api/admin/* 
      if (/\*$/.test(url)) {
        const handler = (request: Request) => {
          return fetch(request)
        }
        return new Channels(handler)
      }
      //api/:method
      const methodIndex = url.lastIndexOf(":")
      if (methodIndex !== -1) {
        const method = url.slice(methodIndex + 1).toUpperCase()
        const handler = (request: Request) => {
          if (request.method.toUpperCase() === method) {
            return fetch(request)
          }
        }
        return new Channels(handler)
      }
      const handler = (request: Request) => {
        const pathname = new URL(request.url).pathname
        if (pathname === url) {
          return fetch(request)
        }
      }
      return new Channels(handler)
    }
  }

  match(request: Request) {
    if (this.handler(request)) {
      return this.handler(request)
    }
    return false
  }



}

export interface IChannelConfig {
  cacheName: string,
  url: string,
  files: RequestInfo[],
  mode: EChannelMode,
}

export enum EChannelMode {
  static = "static",
  pattern = "pattern"
}

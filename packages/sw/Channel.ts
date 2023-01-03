import { EChannelMode, ECommand, IChannelConfig } from "@bfsx/typings";

// deno-lint-ignore no-explicit-any
export type TCmd = { cmd: string, data: any };

function matchRule(command: TCmd, cmd: ECommand) {
  if (command.cmd === cmd) {
    return true
  }
  return false
}

/**
 * 后端控制背压策略
 * @param data 
 * @returns 
 */
export function matchBackPressureOpen(command: TCmd) {
  return matchRule(command, ECommand.openBackPressure)
}

/**
 * 判断是否是后端打开一个通道
 * @param data 
 * @returns 
 */
export function matchOpenChannel(command: TCmd) {
  if (command.cmd === ECommand.openChannel) {
    return command
  }
  return false
}
/**
 * 打开一个message channel port 通道，用于ios跟serviceworker传递消息
 * @param command 
 * @returns 
 */
export function matchOpenMsgChannel(command: TCmd) {
  return matchRule(command, ECommand.openMessageChannel)
}

export function registerChannelId(command: TCmd) {
  return matchRule(command, ECommand.registerChannelId)
}

/**
 *  判断是不是cmd命令 {"cmd":"openBackPressure"} {"cmd":"openChannel"}
 * @param data 
 * @param cmd 
 * @returns 
 */
export function matchCommand(data: string): false | TCmd {
  if (/(cmd)/.test(data)) return JSON.parse(data)
  return false
}



export class Channels {

  notResponse(url: string) {
    return Promise.resolve(new Response(`The backend did not create ${url} channel`))
  }

  constructor(
    readonly config: IChannelConfig
  ) { }

  async handler(request: Request) {
    const config = this.config;
    // 匹配并缓存静态资源
    if (config.mode === EChannelMode.static && config.cacheName && config.files) {
      const cache = await caches.open(config.cacheName);
      await cache.addAll(config.files);
      return caches.match(request).then(res => {
        if (res) return res
        return fetch(request)
      })
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
        return fetch(request)
      }

      /** api/:method */
      const methodIndex = url.lastIndexOf(":")
      if (methodIndex !== -1) {
        const method = url.slice(methodIndex + 1).toUpperCase()
        if (request.method.toUpperCase() === method) {
          return fetch(request)
        }
        return this.notResponse(request.url)
      }
      const pathname = new URL(request.url).pathname
      if (pathname === url) {
        return fetch(request)
      }
    }
    return this.notResponse(request.url)
  }

  match(request: Request) {
    const pathname = new URL(request.url).pathname
    if (/(setUi)/.test(pathname)) {
      return false
    }
    if (/(poll)/.test(pathname)) {
      return false
    }
    if (/(sw)/.test(pathname)) {
      return false
    }
    return true
  }
}


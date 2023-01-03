export interface IChannelConfig {
  cacheName?: string,
  files?: RequestInfo[],
  url: string,
  mode: EChannelMode,
}

export enum EChannelMode {
  static = "static",
  pattern = "pattern"
}



export enum ECommand {
  openBackPressure = "openBackPressure", // 打开背压命令，用于后端控制
  openChannel = "openChannel", // 判断是否是打开一个Channel通道
  openMessageChannel = "openMessageChannel", // 打开一个message channel port 通道用于传递ios消息
  registerChannelId = "registerChannelId"// 注册一个channel id
}

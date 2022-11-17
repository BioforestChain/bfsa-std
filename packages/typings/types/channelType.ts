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
  openBackPressure = "openBackPressure",
  openChannel = "openChannel" // 判断是否是打开一个Channel通道
}

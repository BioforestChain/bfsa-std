import { snowflakeIdv1 } from "./Genid.ts";

export class Channels {
  gen: snowflakeIdv1;
  constructor() {
    this.gen = new snowflakeIdv1({ workerId: 213, seqBitLength: 6 });
  }

  getChannelId() {
    return this.gen.NextId() + "";
  }
}

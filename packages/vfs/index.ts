import { list, ls } from "./src/ls.ts";
import { mkdir } from "./src/mkdir.ts";
import { read, readBuff } from "./src/read.ts";
import { write } from "./src/write.ts";
import { rm } from "./src/delete.ts";
import { stat } from "./src/stat.ts";

const fs = {
  ls,
  list,
  mkdir,
  read,
  readBuff,
  write,
  rm,
  stat,
};
export { fs, list, ls, mkdir, read, readBuff, rm, write, stat };

export { EFilterType } from "./src/vfsType.ts";

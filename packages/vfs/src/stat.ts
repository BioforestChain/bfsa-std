import { network } from "@bfsx/core";
import { vfsHandle } from "../vfsHandle.ts";

/**
 * 文件信息
 * @param path
 * @returns
 */
export async function stat(path: string) {
  const fs = await network.asyncCallDenoFunction(vfsHandle.FileSystemStat, {
    path,
  });
  return fs;
}

import { checkType } from "../../util/index.ts";

/**
 * 等待函数
 * @param delay
 * @returns
 */
export const loop = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * 是否是ios
 * @returns 
 */
export function isIos(): boolean {
  return checkType("webkit", "object")
}

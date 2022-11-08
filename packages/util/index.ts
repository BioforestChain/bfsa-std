/////////////////////////////
/// 放置公共函数
/////////////////////////////

export * from "./binary.ts"
/**
 * 等待函数
 * @param delay
 * @returns
 */
export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

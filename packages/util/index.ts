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


export const checkType = (
  name: string,
  type:
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
) => {
  try {
    return new Function(`return typeof ${name} === "${type}"`)();
  } catch (_) {
    return false;
  }
};

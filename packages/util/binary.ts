
export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

/**
 * 合并Uint8array
 * @param arrs 
 * @returns 
 */
export const contact = (...arrs: Uint8Array[]) => {
  const length = arrs.reduce((l, a) => l += a.length, 0);
  const r = new Uint8Array(length);
  let walk = 0
  for (const arr of arrs) {
    r.set(arr, walk)
    walk += arr.length
  }
  return r
}
/**
 * 合并hex
 * @param arrs 
 * @returns 
 */
export const contactToHex = (...arrs: Uint8Array[]) => {
  const hexs = []
  for (const arr of arrs) {
    hexs.push(binaryToHex(arr))
  }
  return hexs.join(",")
}
/**
 * Uint16 transfrom binary
 * @param num 
 * @returns 
 */
export const uint16_to_binary = (num: number) => {
  const r = new Uint16Array([num]);
  return new Uint8Array(r.buffer)
}
export const uint8_to_binary = (num: number) => {
  return new Uint8Array([num]);
}


/**
 * Uint8Array to hex string
 * @param binary 
 * @returns 
 */
export const binaryToHex = (binary: Uint8Array) => {
  return binary.join()
}
/**
 * hex string to Uint8Array
 * @param hex 
 * @returns 
 */
export const hexToBinary = (hex: string) => {
  return new Uint8Array(hex.split(",").map(v => +v))
} 


export const stringToUint16 = (s: string) => {
  const res = new Uint16Array(s.length);
  for (let i = 0; i < s.length; i += 1) {
    res[i] = s.charCodeAt(i)
  }
  return res
}
export const Uint16ToString = (buffer16: number[] | Uint16Array) => {
  return String.fromCharCode.apply(null, buffer16 as number[])
}
/**
 * 合并Uint8array
 * @param arrs 
 * @returns 
 */
export const contact = (...arrs: Uint16Array[]) => {
  const length = arrs.reduce((l, a) => l += a.length, 0);
  const r = new Uint16Array(length);
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
export const contactToHex = (...arrs: Uint16Array[]) => {
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
  return new Uint16Array([num]);
}
export const uint8_to_binary = (num: number) => {
  return new Uint16Array([num]);
}


/**
 * Uint16Array to hex string
 * @param binary 
 * @returns string
 */
export const binaryToHex = (binary: Uint16Array) => {
  return binary.join()
}
/**
 * hex string to Uint16Array
 * @param hex string
 * @returns Uint8Array
 */
export const hexToBinary = (hex: string) => {
  return new Uint16Array(hex.split(",").map(v => +v))
}

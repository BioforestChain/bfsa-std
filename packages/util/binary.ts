
export const stringToByte = (s: string) => {
  const res: number[] = new Array(s.length);
  for (let i = 0; i < s.length; i += 1) {
    const u = s.codePointAt(i);
    if (u) {
      res[i] = u
    }
  }
  console.log("stringToByte:", res)
  return res
}

/**
 * arrayBuffer to String
 * @param buffer 
 * @returns 
 */
export const bufferToString = (buffer: ArrayBuffer | number[]) => {
  return String.fromCharCode.apply(null, (new Uint16Array(buffer)) as unknown as number[])
}

/**
 * 合并Uint16array
 * @param arrs 
 * @returns 
 */
export const contactNumber = (...arrs: number[][]) => {
  const r: number[] = []
  for (const arr of arrs) {
    r.push(...arr)
  }
  return r
}

/**
 * 合并Uint16array
 * @param arrs 
 * @returns 
 */
export const contactUint16 = (...arrs: Uint16Array[]) => {
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
 * 合并Uint16array
 * @param arrs 
 * @returns 
 */
export const contactUint8 = (...arrs: Uint8Array[]) => {
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
  return new Uint8Array([num]);
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
 * hex string to Uint8Array
 * @param hex string
 * @returns Uint8Array
 */
export const hexToBinary = (hex: string) => {
  return hex.split(",").map(v => +v)
}

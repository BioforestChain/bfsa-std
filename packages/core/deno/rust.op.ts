// your OS.
import "@bfsx/typings";
import { contactUint8, contactUint16 } from "../../util/binary.ts";
import { REQ_CATCH } from "./deno.ts";

/**js 到rust的消息 */
export function js_to_rust_buffer(zerocopybuffer: Uint16Array) {
  Deno.core.opSync("op_js_to_rust_buffer", zerocopybuffer);
}
/**js 到rust的消息： 传递零拷贝消息 */
export function send_zero_copy_buffer(req_id: Uint16Array, zerocopybuffer: ArrayBufferView) {
  let buffer;

  // 需要解析成Uint8
  if (zerocopybuffer.buffer.byteLength % 2 !== 0) {
    buffer = contactUint8(new Uint8Array(req_id.buffer), zerocopybuffer as Uint8Array)

  } else {
    buffer = contactUint16(req_id, new Uint16Array(zerocopybuffer.buffer))
  }
  Deno.core.opSync("op_send_zero_copy_buffer", buffer);
}

/**
 * 发送系统通知
 * @param data
 */
export function setNotification(data: Uint16Array) {
  Deno.core.opSync("op_rust_to_js_set_app_notification", data);
}

/**
 * 循环从rust里拿数据
 * 这里拿的是service worker 构建的 chunk的数据
 */
export async function getRustChunk() {
  const buffer = await Deno.core.opAsync("op_rust_to_js_buffer"); // backDataToRust
  // 没得数据回来
  if (buffer[0] === 0) {
    return {
      value: buffer,
      done: true,
    };
  }

  return {
    value: buffer,
    done: false,
  };
}

// dnt-shim-ignore
// deno-lint-ignore no-explicit-any
(globalThis as any)._getRustBuffer = function _getRustBuffer(head_view: string, buffer: number[]) {
  console.log("deno#getRustBuffer: ", head_view, buffer);
  if (buffer[0] === 0 && buffer.length === 1) {
    return {
      value: buffer,
      done: true,
    };
  }
  console.log("getRustBuffer2: -->  ", buffer)
  // 如果是普通消息,versionID == 1
  if (buffer[0] === 1) {
    buffer.splice(0, 2); //拿到版本号
    buffer.splice(0, 2); // 拿到头部标记
  }
  const buff = new Uint8Array(buffer);
  REQ_CATCH.get(head_view)?.po.resolve(buff);
  REQ_CATCH.delete(head_view)
}


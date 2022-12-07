// your OS.
import "@bfsx/typings";
import { contactUint16 } from "../../util/binary.ts";

/**js 到rust的消息 */
export function js_to_rust_buffer(zerocopybuffer: Uint16Array) {
  Deno.core.opSync("op_js_to_rust_buffer", zerocopybuffer);
}
/**js 到rust的消息： 传递零拷贝消息 */
export function send_zero_copy_buffer(req_id: Uint16Array, zerocopybuffer: ArrayBufferView) {
  Deno.core.opSync("op_send_zero_copy_buffer", contactUint16(req_id, new Uint16Array(zerocopybuffer.buffer)));
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

/**循环从rust里拿数据 */
export function getRustBuffer(ex_head_view: Uint16Array) {
  const uint8_head = new Uint8Array(ex_head_view.buffer);
  const data = `${uint8_head[0]}-${uint8_head[1]}`;
  const buffer = Deno.core.opSync("op_rust_to_js_system_buffer", data); // backSystemDataToRust
  if (buffer[0] === 0 && buffer.length === 1) {
    return {
      value: buffer,
      done: true,
    };
  }
  // console.log("getRustBuffer2: -->  ", buffer)
  // 如果是普通消息,versionID == 1
  if (buffer[0] === 1) {
    buffer.splice(0, 2); //拿到版本号
    buffer.splice(0, 2); // 拿到头部标记
  }
  // const buff = new Uint8Array(buffer);
  return {
    value: buffer,
    done: false,
  };

}

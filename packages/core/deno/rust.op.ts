// your OS.
import "@bfsx/typings";

/**js 到rust的消息 */
export function js_to_rust_buffer(zerocopybuffer: Uint16Array) {
  Deno.core.opSync("op_js_to_rust_buffer", new Uint8Array(zerocopybuffer.buffer));
}
/**js 到rust的消息： 调用android方法执行evenjs，即传递消息给前端 */
export function send_zero_copy_buffer(req_id:Uint16Array,zerocopybuffer: ArrayBufferView) {
  Deno.core.opSync("op_send_zero_copy_buffer", req_id, new Uint8Array(zerocopybuffer.buffer));
}

/**
 * 发送系统通知
 * @param data
 */
export function setNotification(data: Uint16Array) {
  Deno.core.opSync("op_rust_to_js_set_app_notification", new Uint8Array(data.buffer));
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
let _versionView: Uint16Array = new Uint16Array(1);
let _headView: Uint8Array = new Uint8Array(2);
/**循环从rust里拿数据 */
export async function getRustBuffer(ex_head_view: Uint8Array) {
  const data = `${ex_head_view[0]}-${ex_head_view[1]}`;
  const buffer = await Deno.core.opSync("op_rust_to_js_system_buffer", data); // backSystemDataToRust
  if (buffer[0] === 0 && buffer.length === 1) {
    return {
      value: buffer,
      versionView:_versionView,
      headView:_headView,
      done: true,
    };
  }
  console.log("getRustBuffer 🥸", buffer)
  // 如果是普通消息,versionID == 1
  if (buffer[0] === 1) {
    _versionView = buffer.splice(0, 2); //拿到版本号
    _headView = buffer.splice(0, 2); // 拿到头部标记
  }
  // const buff = new Uint8Array(buffer);
  return {
    value: buffer,
    versionView:_versionView,
    headView:_headView,
    done: false,
  };

}

// your OS.
import "@bfsx/typings";

/**js 到rust的消息 */
export function js_to_rust_buffer(data: Uint8Array) {
  Deno.core.opSync("op_js_to_rust_buffer", data);
}
/**js 到rust的消息： 调用android方法执行evenjs，即传递消息给前端 */
export function eval_js(data: Uint8Array) {
  Deno.core.opSync("op_eval_js", data);
}

/**
 * 发送系统通知
 * @param data
 */
export function setNotification(data: Uint8Array) {
  Deno.core.opSync("op_rust_to_js_set_app_notification", data);
}


/**
 * 循环从rust里拿数据
 * 这里拿的是service worker 构建的 chunk的数据
 */
export function loopRustChunk() {
  return {
    async next() {
      try {
        const buffer = await Deno.core.opAsync("op_rust_to_js_buffer"); // backDataToRust
        return {
          value: buffer,
          done: false,
        };
      } catch (_e) {
        return {
          value: null,
          done: true,
        };
      }
    }
  };
}
/**循环从rust里拿数据 */
export async function getRustBuffer() {
  let buffer: number[] = [];
  let versionView: number[] = [];
  let headView: number[] = [];
  try {
    buffer = await Deno.core.opAsync("op_rust_to_js_system_buffer"); // backSystemDataToRust
    // 如果是普通消息,versionID == 1
    if (buffer[0] === 1) {
      versionView = buffer.splice(0, 1); //拿到版本号
      headView = buffer.splice(0, 2); // 拿到头部标记
    }
    const buff = new Uint8Array(buffer);
    return {
      value: buff,
      versionView,
      headView,
      done: false,
    };
  } catch (_e) {
    return {
      value: new Uint8Array(),
      versionView,
      headView,
      done: true,
    };
  }
}

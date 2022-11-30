// your OS.
import "@bfsx/typings";

/**js 到rust的消息 */
export function js_to_rust_buffer(data: number[]) {
  console.log("op_js_to_rust_buffer:🍜", data)
  Deno.core.opSync("op_js_to_rust_buffer", new Uint8Array(data));
}
/**js 到rust的消息： 调用android方法执行evenjs，即传递消息给前端 */
export function eval_js(data: number[]) {
  Deno.core.opSync("op_eval_js", data);
}

/**
 * 发送系统通知
 * @param data
 */
export function setNotification(data: number[]) {
  Deno.core.opSync("op_rust_to_js_set_app_notification", new Uint8Array(data));
}

/**
 * 循环从rust里拿数据
 * 这里拿的是service worker 构建的 chunk的数据
 */
export async function getRustChunk() {
  // console.log("getRustChunk=> 😶‍🌫️🥶🫥 我调用了op_rust_to_js_buffer");
  const buffer = await Deno.core.opAsync("op_rust_to_js_buffer"); // backDataToRust
  // 没得数据回来
  if (buffer[0] === 0) {
    return {
      value: [0],
      done: true,
    };
  }
  return {
    value: buffer,
    done: false,
  };
}

/**循环从rust里拿数据 */
export async function getRustBuffer(ex_head_view: number[]) {
  let versionView: number[] = [];
  let headView: number[] = [];
  const data = `${ex_head_view[0]}-${ex_head_view[1]}`;
  const buffer = await Deno.core.opSync("op_rust_to_js_system_buffer", data); // backSystemDataToRust
  if (buffer[0] === 0 && buffer.length === 1) {
    return {
      value: new Uint8Array(),
      versionView,
      headView,
      done: true,
    };
  }
  console.log("getRustBuffer 🥸", buffer)
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

}

import { test } from '../index.ts';
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { isIOS } from '../../packages/plugin/util/index.ts';
import { getCallNative } from "../../packages/plugin/gateway/network.ts";
import { NativeHandle } from "../../packages/plugin/common/nativeHandle.ts";


test("app方法退出", async () => {
  const signal = await getCallNative(NativeHandle.ExitApp);
  assertEquals(signal, true)
})

test({
  name: "监听app返回(android only)",
  ignore: isIOS,
  fn() {
    doAndroidListenBackButton();
  },
});

function doAndroidListenBackButton() {

}

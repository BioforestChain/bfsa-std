import { App } from "../../packages/plugin/native/app.ts";
import { test } from '../index.ts';
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { isIOS } from '../../packages/plugin/util/index.ts';

const app = new App();

test("app方法退出", async () => {
  const signal = await app.exitApp()
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

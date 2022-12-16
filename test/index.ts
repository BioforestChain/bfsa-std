
import { beforeAll } from "https://deno.land/std@0.168.0/testing/bdd.ts";
import { registerServiceWorker } from "../packages/plugin/gateway/network.ts"

beforeAll(() => {
  console.log("🚥 开始运行单元测试")
  registerServiceWorker()
})

export const test = Deno.test

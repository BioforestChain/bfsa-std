
import { beforeAll } from "https://deno.land/std@0.168.0/testing/bdd.ts";
import { registerServiceWorker } from "../packages/plugin/gateway/network.ts"

beforeAll(() => {
  console.log("π₯ εΌε§θΏθ‘εεζ΅θ―")
  registerServiceWorker()
})

export const test = Deno.test

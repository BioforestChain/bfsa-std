import type { PlaocJavascriptBridge } from "@bfsx/typings";

// dnt-shim-ignore
// deno-lint-ignore no-explicit-any
export default (globalThis as any)
  .PlaocJavascriptBridge as PlaocJavascriptBridge;

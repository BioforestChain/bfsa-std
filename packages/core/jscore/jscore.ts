import type { PlaocJavascriptBridge } from "@bfsx/typings";

// dnt-shim-ignore
export default (globalThis as any)
  .PlaocJavascriptBridge as PlaocJavascriptBridge;

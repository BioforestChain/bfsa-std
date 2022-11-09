import { Color } from "./colorType.ts";
import "./jsxType.ts";

export function hex<T extends string>(s: Color.HexColor<T>): T {
  return s;
}

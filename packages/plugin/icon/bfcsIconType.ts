export namespace Icon {
  export const enum EIconType {
    NamedIcon = "NamedIcon",
    AssetIcon = "AssetIcon",
  }

  export type IconType = "NamedIcon" | "AssetIcon";

  export interface IPlaocIcon {
    source: string;
    type?: IconType;
    description?: string;
    size?: number;
  }
}

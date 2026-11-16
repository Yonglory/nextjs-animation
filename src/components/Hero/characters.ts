import type { FluffyEars, FluffyColor, FluffyFace } from "@/components/Fluffy/Fluffy";

export interface HeroCharacter {
  id: string;
  color: FluffyColor;
  face: FluffyFace;
  ears: FluffyEars;
  /** Desktop/tablet position (percent of the stage) of the character's center. */
  x: number;
  y: number;
  /** Optional mobile position override. */
  mx?: number;
  my?: number;
  /** Size multiplier relative to the hero's --unit. */
  size: number;
  /**
   * 1 = always shown, 2 = tablet and up, 3 = desktop only.
   * Dropped by one level on low-power devices (see hero.module.scss and Hero.tsx).
   */
  tier: 1 | 2 | 3;
}

/** Back layer: small and slow. Mid layer: medium. Front layer: big and fast. */
export const HERO_LAYERS: { depth: number; characters: HeroCharacter[] }[] = [
  {
    depth: 0.4,
    characters: [
      { id: "b1", color: "butter", face: "smile", ears: "none", x: 8, y: 24, mx: 16, my: 20, size: 0.7, tier: 1 },
      { id: "b2", color: "lavender", face: "wink", ears: "cat", x: 92, y: 20, mx: 84, my: 16, size: 0.75, tier: 1 },
      { id: "b3", color: "mint", face: "sleepy", ears: "none", x: 28, y: 12, size: 0.6, tier: 3 },
      { id: "b4", color: "pink", face: "oh", ears: "antenna", x: 72, y: 10, size: 0.6, tier: 3 },
      { id: "b5", color: "sky", face: "smile", ears: "bunny", x: 50, y: 92, size: 0.6, tier: 3 },
    ],
  },
  {
    depth: 0.8,
    characters: [
      { id: "m1", color: "coral", face: "open", ears: "bunny", x: 17, y: 62, mx: 42, my: 76, size: 1, tier: 1 },
      { id: "m2", color: "sky", face: "wink", ears: "cat", x: 84, y: 60, mx: 80, my: 70, size: 1, tier: 1 },
      { id: "m3", color: "mint", face: "sleepy", ears: "none", x: 31, y: 85, size: 0.85, tier: 2 },
      { id: "m4", color: "butter", face: "oh", ears: "antenna", x: 68, y: 85, size: 0.85, tier: 2 },
    ],
  },
  {
    depth: 1.4,
    characters: [
      { id: "f1", color: "pink", face: "smile", ears: "bunny", x: 4, y: 78, mx: 12, my: 82, size: 1.3, tier: 1 },
      { id: "f2", color: "lavender", face: "open", ears: "none", x: 96, y: 76, mx: 90, my: 83, size: 1.25, tier: 1 },
    ],
  },
];

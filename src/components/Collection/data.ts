import type { FluffyColor, FluffyEars, FluffyFace } from "@/components/Fluffy/Fluffy";

export interface CrewMember {
  id: string;
  name: string;
  trait: string;
  color: FluffyColor;
  face: FluffyFace;
  ears: FluffyEars;
}

export const CREW: CrewMember[] = [
  { id: "001", name: "Biscuit", trait: "Professional hugger", color: "butter", face: "smile", ears: "bunny" },
  { id: "002", name: "Pip", trait: "Loves a good nap", color: "mint", face: "sleepy", ears: "none" },
  { id: "003", name: "Marlow", trait: "Always up to something", color: "coral", face: "wink", ears: "cat" },
  { id: "004", name: "Juniper", trait: "Collects shiny things", color: "lavender", face: "open", ears: "antenna" },
  { id: "005", name: "Waffles", trait: "Surprised by everything", color: "pink", face: "oh", ears: "bunny" },
  { id: "006", name: "Cloud", trait: "Floats a little higher", color: "sky", face: "smile", ears: "none" },
];

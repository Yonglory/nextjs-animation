import type { ReactNode } from "react";
import styles from "./fluffy.module.scss";

export const FLUFFY_COLORS = {
  butter: { body: "#ffd45e", shade: "#f0b02e" },
  coral: { body: "#ff7a6b", shade: "#e2564a" },
  mint: { body: "#7fe3c1", shade: "#4cc29a" },
  lavender: { body: "#b8a4ff", shade: "#8f78ee" },
  pink: { body: "#ff9fcb", shade: "#ee6ba6" },
  sky: { body: "#8fd0ff", shade: "#58afee" },
} as const;

export type FluffyColor = keyof typeof FLUFFY_COLORS;
export type FluffyFace = "smile" | "open" | "wink" | "sleepy" | "oh";
export type FluffyEars = "none" | "bunny" | "cat" | "antenna";

export interface FluffyProps {
  color: FluffyColor;
  face?: FluffyFace;
  ears?: FluffyEars;
  /** Number of fur tufts around the body outline. */
  bumps?: number;
  className?: string;
}

const NAVY = "#0b2a6b";
const CX = 100;
const CY = 112;
const RX = 70;
const RY = 62;

const round = (n: number) => Math.round(n * 100) / 100;
const pathCache = new Map<number, string>();

/** Scalloped ("fluffy") closed outline made of quadratic curves bulging outwards. */
function bodyPath(bumps: number): string {
  const cached = pathCache.get(bumps);
  if (cached) return cached;

  const step = (Math.PI * 2) / bumps;
  const point = (a: number, k = 1) => `${round(CX + RX * k * Math.cos(a))} ${round(CY + RY * k * Math.sin(a))}`;

  let d = `M${point(-Math.PI / 2)}`;
  for (let i = 0; i < bumps; i++) {
    const a = -Math.PI / 2 + i * step;
    d += ` Q${point(a + step / 2, 1.2)} ${point(a + step)}`;
  }
  d += "Z";
  pathCache.set(bumps, d);
  return d;
}

function Ears({ ears, body, shade }: { ears: FluffyEars; body: string; shade: string }) {
  switch (ears) {
    case "bunny":
      return (
        <g>
          <ellipse cx="72" cy="36" rx="15" ry="34" transform="rotate(-10 72 36)" fill={body} />
          <ellipse cx="72" cy="38" rx="7" ry="22" transform="rotate(-10 72 38)" fill={shade} opacity="0.55" />
          <ellipse cx="130" cy="34" rx="15" ry="34" transform="rotate(12 130 34)" fill={body} />
          <ellipse cx="130" cy="36" rx="7" ry="22" transform="rotate(12 130 36)" fill={shade} opacity="0.55" />
        </g>
      );
    case "cat":
      return (
        <g strokeLinejoin="round" strokeWidth="12" stroke={body}>
          <path d="M48 84 L54 36 L92 62 Z" fill={body} />
          <path d="M152 84 L146 36 L108 62 Z" fill={body} />
          <path d="M58 70 L60 46 L80 62 Z" fill={shade} stroke={shade} strokeWidth="4" opacity="0.6" />
          <path d="M142 70 L140 46 L120 62 Z" fill={shade} stroke={shade} strokeWidth="4" opacity="0.6" />
        </g>
      );
    case "antenna":
      return (
        <g>
          <path d="M100 58 Q96 36 104 20" stroke={shade} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="104" cy="18" r="9" fill="#ff6b5e" />
        </g>
      );
    default:
      return null;
  }
}

function Face({ face, blush }: { face: FluffyFace; blush: string }) {
  const eye = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy="104" rx="6.5" ry="8" fill={NAVY} />
      <circle cx={x + 2} cy="101" r="2.2" fill="#fff" />
    </g>
  );
  const arc = (x: number) => (
    <path key={x} d={`M${x - 8} 106 Q${x} 98 ${x + 8} 106`} stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />
  );
  const sleepy = (x: number) => (
    <path key={x} d={`M${x - 8} 102 Q${x} 110 ${x + 8} 102`} stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />
  );

  let eyes: ReactNode;
  let mouth: ReactNode;
  switch (face) {
    case "wink":
      eyes = [arc(78), eye(122)];
      mouth = <path d="M88 122 Q100 134 112 122" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />;
      break;
    case "sleepy":
      eyes = [sleepy(78), sleepy(122)];
      mouth = <ellipse cx="100" cy="126" rx="5" ry="4" fill={NAVY} />;
      break;
    case "open":
      eyes = [eye(78), eye(122)];
      mouth = <path d="M88 118 Q100 142 112 118 Z" fill={NAVY} strokeLinejoin="round" stroke={NAVY} strokeWidth="3" />;
      break;
    case "oh":
      eyes = [eye(78), eye(122)];
      mouth = <ellipse cx="100" cy="128" rx="6" ry="8" fill={NAVY} />;
      break;
    default:
      eyes = [eye(78), eye(122)];
      mouth = <path d="M88 120 Q100 134 112 120" stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" />;
  }

  return (
    <g>
      <ellipse cx="62" cy="122" rx="10" ry="6.5" fill={blush} opacity="0.55" />
      <ellipse cx="138" cy="122" rx="10" ry="6.5" fill={blush} opacity="0.55" />
      {eyes}
      {mouth}
    </g>
  );
}

/** Purely decorative SVG character. All variants are drawn in code: no image requests. */
export default function Fluffy({ color, face = "smile", ears = "none", bumps = 14, className }: FluffyProps) {
  const { body, shade } = FLUFFY_COLORS[color];

  return (
    <svg
      viewBox="0 0 200 200"
      className={className ? `${styles.fluffy} ${className}` : styles.fluffy}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="100" cy="186" rx="50" ry="7" fill={NAVY} opacity="0.12" />
      <Ears ears={ears} body={body} shade={shade} />
      <ellipse cx="76" cy="170" rx="17" ry="11" fill={shade} />
      <ellipse cx="124" cy="170" rx="17" ry="11" fill={shade} />
      <ellipse cx="32" cy="120" rx="14" ry="22" transform="rotate(20 32 120)" fill={body} />
      <ellipse cx="168" cy="120" rx="14" ry="22" transform="rotate(-20 168 120)" fill={body} />
      <path d={bodyPath(bumps)} fill={body} />
      <ellipse cx="72" cy="78" rx="22" ry="11" transform="rotate(-25 72 78)" fill="#fff" opacity="0.28" />
      <Face face={face} blush={shade} />
    </svg>
  );
}

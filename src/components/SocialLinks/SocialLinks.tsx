import styles from "./social-links.module.scss";

const LINKS = [
  {
    label: "Chat",
    icon: <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />,
  },
  {
    label: "Shop",
    icon: <path d="M6 8h12l1.5 12h-15L6 8Zm3 0V7a3 3 0 0 1 6 0v1" />,
  },
  {
    label: "Social",
    icon: <path d="M6 5l12 14M18 5L6 19" />,
  },
] as const;

/**
 * Decorative social buttons: no real destination, but with full hover/focus states.
 * Each `<li>` is the GSAP entrance target; the inner `<a>` owns the CSS hover transform.
 */
export default function SocialLinks() {
  return (
    <ul className={styles.list} aria-label="Social links">
      {LINKS.map((link) => (
        <li key={link.label} data-chrome>
          <a href="#hero" className={styles.link} aria-label={link.label}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {link.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

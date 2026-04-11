import Image from "next/image";

interface SiteLogoProps {
  /** Height of the crown icon in px */
  size?: number;
  /** "dark" = navy text (for light backgrounds), "light" = white text (for dark backgrounds) */
  theme?: "dark" | "light";
}

export function SiteLogo({ size = 36, theme = "dark" }: SiteLogoProps) {
  const textColor = theme === "dark" ? "#1a2755" : "#FEFCF7";
  const gold = "#B8944F";
  const fontSize = size * 1.1;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.15 }}>
      <Image
        src="/favicon.png"
        alt=""
        width={537}
        height={733}
        style={{
          height: `${size}px`,
          width: "auto",
          filter: theme === "light" ? "brightness(0) invert(1)" : "none",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1,
          color: textColor,
        }}
      >
        chief.<span style={{ color: gold }}>ME</span>
      </span>
    </span>
  );
}

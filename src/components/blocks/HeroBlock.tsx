import { useThemeStore } from "../../stores/useThemeStore";
import type { HeroBlock } from "../../types/blocks";

interface Props {
  block: HeroBlock;
  isEditing?: boolean;
}

export default function HeroBlock({ block }: Props) {
  const { heading, subheading, ctaLabel, ctaHref, ctaVariant, ctaSecondaryLabel, ctaSecondaryHref,
    backgroundImage, backgroundColor, overlayColor, headingColor, subheadingColor,
    textAlign, paddingTop, paddingBottom, minHeight } = block.props;

  const theme = useThemeStore((s) => s.theme);
  const radius = `${theme.borderRadius}px`;
  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  const bgStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: `${minHeight}px`,
    paddingTop,
    paddingBottom,
    display: "flex",
    alignItems: "center",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: theme.primaryColor, color: "#fff", border: `2px solid ${theme.primaryColor}` },
    secondary: { background: theme.secondaryColor, color: "#fff", border: `2px solid ${theme.secondaryColor}` },
    outline: { background: "transparent", color: "#fff", border: "2px solid #fff" },
  };

  return (
    <div style={bgStyle}>
      {/* Overlay */}
      {overlayColor && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: overlayColor }} />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: alignMap[textAlign], textAlign: textAlign as React.CSSProperties["textAlign"] }}>
          <h1 style={{ color: headingColor, fontSize: "3rem", fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
            {heading}
          </h1>
          {subheading && (
            <p style={{ color: subheadingColor, fontSize: "1.2rem", lineHeight: 1.6, margin: "0 0 32px", maxWidth: "600px" }}>
              {subheading}
            </p>
          )}
          {(ctaLabel || ctaSecondaryLabel) && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: alignMap[textAlign] }}>
              {ctaLabel && (
                <a
                  href={ctaHref}
                  style={{ ...variantStyles[ctaVariant], padding: "14px 28px", borderRadius: radius, fontWeight: 700, fontSize: "1rem", textDecoration: "none", display: "inline-block" }}
                >
                  {ctaLabel}
                </a>
              )}
              {ctaSecondaryLabel && (
                <a
                  href={ctaSecondaryHref}
                  style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.5)", padding: "14px 28px", borderRadius: radius, fontWeight: 600, fontSize: "1rem", textDecoration: "none", display: "inline-block" }}
                >
                  {ctaSecondaryLabel}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

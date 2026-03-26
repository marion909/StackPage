import { useState } from "react";
import type { NavigationBlock, NavigationProps } from "../../types/blocks";

interface Props {
  block: NavigationBlock;
  onChange: (p: Partial<NavigationProps>) => void;
  isEditing: boolean;
}

export default function NavigationBlock({ block, onChange: _onChange, isEditing }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoText, logoImageSrc, logoType, links, sticky, backgroundColor, textColor } = block.props;

  return (
    <nav
      style={{
        backgroundColor,
        color: textColor,
        position: sticky ? "sticky" : "relative",
        top: sticky ? 0 : undefined,
        zIndex: sticky ? 100 : undefined,
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        {/* Logo */}
        {logoType === "image" && logoImageSrc ? (
          <img src={logoImageSrc} alt={logoText} style={{ height: "36px", objectFit: "contain" }} />
        ) : (
          <span style={{ fontWeight: 700, fontSize: "1.125rem", color: textColor }}>{logoText}</span>
        )}

        {/* Desktop links */}
        <div data-nav-links style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {links.map((link) => (
            <a
              key={link.id}
              href={isEditing ? undefined : link.href}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
              style={{ color: textColor, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Hamburger button (shown in editor as a visual indicator; functional in exported HTML via jsGenerator) */}
        <button
          data-hamburger
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none", // hidden on desktop via CSS; jsGenerator toggles display on mobile
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: textColor,
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: textColor, borderRadius: "2px", transition: "transform 0.2s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: textColor, borderRadius: "2px", opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ display: "block", width: "22px", height: "2px", backgroundColor: textColor, borderRadius: "2px", transition: "transform 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu (visible in editor when hamburger clicked in tablet/mobile preview) */}
      {mobileOpen && (
        <div style={{ backgroundColor, borderTop: "1px solid rgba(0,0,0,0.08)", padding: "8px 16px 16px" }}>
          {links.map((link) => (
            <a
              key={link.id}
              href={isEditing ? undefined : link.href}
              onClick={isEditing ? (e) => e.preventDefault() : undefined}
              style={{ display: "block", color: textColor, textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

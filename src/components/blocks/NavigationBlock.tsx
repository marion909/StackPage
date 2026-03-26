import { useState } from "react";
import type { NavigationBlock, NavigationProps } from "../../types/blocks";

interface Props {
  block: NavigationBlock;
  onChange: (p: Partial<NavigationProps>) => void;
  isEditing: boolean;
}

export default function NavigationBlock({ block, onChange: _onChange, isEditing }: Props) {
  const [_mobileOpen, _setMobileOpen] = useState(false);
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
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
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
      </div>
    </nav>
  );
}

import { useThemeStore } from "../../stores/useThemeStore";
import type { ProductCardBlock, ProductCardProps } from "../../types/blocks";

interface Props {
  block: ProductCardBlock;
  onChange: (p: Partial<ProductCardProps>) => void;
  isEditing: boolean;
}

export default function ProductCardBlock({ block, onChange: _onChange, isEditing }: Props) {
  const {
    name, description, price, imageSrc, imageAlt, badge,
    ctaLabel, ctaHref, ctaTarget,
    paddingTop, paddingBottom, borderRadius, shadow, outlined, backgroundColor,
  } = block.props;
  const theme = useThemeStore((s) => s.theme);

  const cardStyle: React.CSSProperties = {
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    overflow: "hidden",
    boxShadow: shadow ? "0 4px 24px rgba(0,0,0,0.10)" : undefined,
    border: outlined ? "1px solid #e2e8f0" : undefined,
    paddingBottom: `${paddingBottom}px`,
  };

  return (
    <div style={cardStyle}>
      <div style={{ position: "relative" }}>
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "4/3", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
            No image
          </div>
        )}
        {badge && (
          <span style={{ position: "absolute", top: "12px", left: "12px", background: theme.accentColor, color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: `${paddingTop}px 16px 0` }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 700, color: theme.textColor }}>{name}</h3>
        {description && <p style={{ margin: "0 0 10px", fontSize: "0.875rem", color: theme.secondaryColor, lineHeight: 1.5 }}>{description}</p>}
        <p style={{ margin: "0 0 14px", fontSize: "1.25rem", fontWeight: 800, color: theme.primaryColor }}>{price}</p>
        {ctaLabel && (
          <a
            href={isEditing ? undefined : ctaHref}
            target={ctaTarget}
            onClick={isEditing ? (e) => e.preventDefault() : undefined}
            style={{ display: "block", textAlign: "center", background: theme.primaryColor, color: "#fff", padding: "10px", borderRadius: `${theme.borderRadius}px`, textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}

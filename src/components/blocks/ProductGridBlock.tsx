import { useThemeStore } from "../../stores/useThemeStore";
import type { ProductGridBlock, ProductGridProps, ProductCardItem } from "../../types/blocks";

interface Props {
  block: ProductGridBlock;
  onChange: (p: Partial<ProductGridProps>) => void;
  isEditing: boolean;
}

export default function ProductGridBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { items, columns, gap, paddingTop, paddingBottom, cardStyle, borderRadius, backgroundColor } = block.props;
  const theme = useThemeStore((s) => s.theme);

  const cardBorderStyle = cardStyle === "outlined" ? "1px solid #e2e8f0" : undefined;
  const cardShadow = cardStyle === "shadowed" ? "0 4px 24px rgba(0,0,0,0.10)" : undefined;

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      {items.length === 0 && isEditing ? (
        <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
          Product Grid — add items in the properties panel
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}>
          {items.map((item: ProductCardItem) => (
            <div key={item.id} style={{ backgroundColor: "#fff", borderRadius: `${borderRadius}px`, overflow: "hidden", border: cardBorderStyle, boxShadow: cardShadow, paddingBottom: "16px" }}>
              <div style={{ position: "relative" }}>
                {item.imageSrc ? (
                  <img src={item.imageSrc} alt={item.imageAlt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.75rem" }}>No image</div>
                )}
                {item.badge && (
                  <span style={{ position: "absolute", top: "10px", left: "10px", background: theme.accentColor, color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <div style={{ padding: "12px 14px 4px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: theme.textColor }}>{item.name}</h3>
                {item.description && <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: theme.secondaryColor, lineHeight: 1.5 }}>{item.description}</p>}
                <p style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: 800, color: theme.primaryColor }}>{item.price}</p>
                {item.ctaLabel && (
                  <a
                    href={isEditing ? undefined : item.ctaHref}
                    target={item.ctaTarget}
                    onClick={isEditing ? (e) => e.preventDefault() : undefined}
                    style={{ display: "block", textAlign: "center", background: theme.primaryColor, color: "#fff", padding: "8px", borderRadius: `${theme.borderRadius}px`, textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}
                  >
                    {item.ctaLabel}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

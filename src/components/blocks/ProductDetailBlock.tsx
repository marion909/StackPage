import { useState } from "react";
import { useThemeStore } from "../../stores/useThemeStore";
import type { ProductDetailBlock, ProductDetailProps } from "../../types/blocks";

interface Props {
  block: ProductDetailBlock;
  onChange: (p: Partial<ProductDetailProps>) => void;
  isEditing: boolean;
}

export default function ProductDetailBlock({ block, onChange: _onChange, isEditing }: Props) {
  const {
    name, description, price, imageSrc, imageAlt, badge,
    ctaLabel, ctaHref, ctaTarget,
    features, layout, galleryImages, backgroundColor, paddingTop, paddingBottom, accentColor,
  } = block.props;
  const theme = useThemeStore((s) => s.theme);

  const allImages = [imageSrc, ...(galleryImages ?? [])].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);
  const currentImg = allImages[activeImg] ?? "";

  const imageSection = (
    <div style={{ flex: "1 1 50%", minWidth: "280px" }}>
      <div style={{ position: "relative" }}>
        {currentImg ? (
          <img src={currentImg} alt={imageAlt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "12px", display: "block" }} />
        ) : (
          <div style={{ width: "100%", aspectRatio: "4/3", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.875rem" }}>No image</div>
        )}
        {badge && (
          <span style={{ position: "absolute", top: "14px", left: "14px", background: accentColor ?? theme.accentColor, color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: "20px" }}>
            {badge}
          </span>
        )}
      </div>
      {allImages.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          {allImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              onClick={() => setActiveImg(i)}
              style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: i === activeImg ? `2px solid ${theme.primaryColor}` : "2px solid #e2e8f0" }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const infoSection = (
    <div style={{ flex: "1 1 50%", minWidth: "280px" }}>
      <h2 style={{ margin: "0 0 10px", fontSize: "1.75rem", fontWeight: 800, color: theme.textColor }}>{name}</h2>
      <p style={{ margin: "0 0 16px", fontSize: "2rem", fontWeight: 800, color: theme.primaryColor }}>{price}</p>
      {description && <p style={{ margin: "0 0 20px", fontSize: "1rem", color: theme.secondaryColor, lineHeight: 1.7 }}>{description}</p>}
      {features && features.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "0.9rem", color: theme.textColor }}>
              <span style={{ color: accentColor ?? theme.accentColor, fontWeight: 700 }}>✓</span> {f}
            </li>
          ))}
        </ul>
      )}
      {ctaLabel && (
        <a
          href={isEditing ? undefined : ctaHref}
          target={ctaTarget}
          onClick={isEditing ? (e) => e.preventDefault() : undefined}
          style={{ display: "inline-block", background: theme.primaryColor, color: "#fff", padding: "14px 32px", borderRadius: `${theme.borderRadius}px`, textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );

  const isTopLayout = layout === "image-top";
  const isRightLayout = layout === "image-right";

  return (
    <div style={{ backgroundColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px`, padding: `${paddingTop}px 16px ${paddingBottom}px` }}>
      {isTopLayout ? (
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {imageSection}
          {infoSection}
        </div>
      ) : (
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "40px", flexDirection: isRightLayout ? "row-reverse" : "row" }}>
          {imageSection}
          {infoSection}
        </div>
      )}
    </div>
  );
}

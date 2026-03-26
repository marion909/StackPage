import type { GalleryBlock, GalleryBlockProps } from "../../types/blocks";

interface Props {
  block: GalleryBlock;
  onChange: (p: Partial<GalleryBlockProps>) => void;
  isEditing: boolean;
}

export default function GalleryBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { images, columns, gap, showCaptions, borderRadius } = block.props;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {images.length === 0 && isEditing ? (
        <div
          style={{
            gridColumn: `1 / -1`,
            border: "1px dashed #e2e8f0",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "0.875rem",
          }}
        >
          Add images in the Properties panel →
        </div>
      ) : (
        images.map((img) => (
          <div key={img.id} style={{ overflow: "hidden", borderRadius: borderRadius ? `${borderRadius}px` : 0 }}>
            {img.src ? (
              <img
                src={img.src}
                alt={img.alt}
                style={{ width: "100%", objectFit: "cover", display: "block", aspectRatio: "4/3" }}
              />
            ) : (
              <div style={{ aspectRatio: "4/3", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                🖼
              </div>
            )}
            {showCaptions && img.caption && (
              <p style={{ fontSize: "0.8rem", color: "#64748b", padding: "4px 0", textAlign: "center" }}>
                {img.caption}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

import type { ImageBlock, ImageBlockProps } from "../../types/blocks";

interface Props {
  block: ImageBlock;
  onChange: (p: Partial<ImageBlockProps>) => void;
  isEditing: boolean;
}

export default function ImageBlock({ block, onChange, isEditing }: Props) {
  const { src, alt, width, align, objectFit, borderRadius, caption } = block.props;
  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: alignMap[align] }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: `${width}%`,
            objectFit,
            borderRadius: borderRadius ? `${borderRadius}px` : 0,
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: `${width}%`,
            paddingTop: "56.25%",
            backgroundColor: "#f1f5f9",
            border: "2px dashed #e2e8f0",
            borderRadius: borderRadius ? `${borderRadius}px` : 0,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            {isEditing ? "🖼 Click Properties to set image URL" : "Image"}
          </div>
        </div>
      )}
      {caption && (
        <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem", textAlign: align as any }}>
          {caption}
        </p>
      )}
    </div>
  );
}

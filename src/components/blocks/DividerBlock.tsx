import type { DividerBlock } from "../../types/blocks";

interface Props {
  block: DividerBlock;
  isEditing?: boolean;
}

export default function DividerBlock({ block }: Props) {
  const { variant, height, color, lineStyle, width, marginTop, marginBottom } = block.props;

  if (variant === "spacer") {
    return <div style={{ height: `${height}px`, marginTop, marginBottom }} />;
  }

  return (
    <div style={{ marginTop, marginBottom, display: "flex", justifyContent: "center" }}>
      <hr
        style={{
          width: `${width}%`,
          borderTop: `${height}px ${lineStyle} ${color}`,
          border: "none",
          borderTopStyle: lineStyle,
          borderTopWidth: `${height}px`,
          borderTopColor: color,
          margin: 0,
        }}
      />
    </div>
  );
}

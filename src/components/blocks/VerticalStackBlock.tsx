import type { VerticalStackBlock, VerticalStackProps } from "../../types/blocks";
import type { Block } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";

interface Props {
  block: VerticalStackBlock;
  onChange: (p: Partial<VerticalStackProps>) => void;
  isEditing: boolean;
}

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

export default function VerticalStackBlock({ block, onChange: _onChange, isEditing }: Props) {
  const {
    gap, align, showDivider, dividerColor,
    backgroundColor, paddingTop, paddingBottom, paddingLeft, paddingRight,
    children,
  } = block.props;

  const items: React.ReactNode[] = [];
  children.forEach((b: Block, idx: number) => {
    items.push(
      <div key={b.id} style={{ alignSelf: align === "stretch" ? "stretch" : ALIGN_MAP[align], width: align === "stretch" ? "100%" : undefined }}>
        <BlockRenderer block={b} isEditing={isEditing} />
      </div>
    );
    if (showDivider && idx < children.length - 1) {
      items.push(
        <hr key={`div-${idx}`} style={{ border: "none", borderTop: `1px solid ${dividerColor}`, margin: "0" }} />
      );
    }
  });

  if (children.length === 0 && isEditing) {
    items.push(
      <div key="placeholder" style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
        Vertical Stack — drop blocks here
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        alignItems: ALIGN_MAP[align],
      }}
    >
      {items}
    </div>
  );
}

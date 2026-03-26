import type { TwoColumnBlock, TwoColumnProps } from "../../types/blocks";
import type { Block } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";

interface Props {
  block: TwoColumnBlock;
  onChange: (p: Partial<TwoColumnProps>) => void;
  isEditing: boolean;
}

export default function TwoColumnBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { gap, leftWidth, leftChildren, rightChildren, stackOnMobile, backgroundColor, paddingTop, paddingBottom } = block.props;
  const rightWidth = 100 - leftWidth;

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ display: "flex", flexWrap: stackOnMobile ? "wrap" : "nowrap", gap: `${gap}px` }}>
        <div style={{ flex: `0 0 calc(${leftWidth}% - ${gap / 2}px)`, minWidth: "200px" }}>
          {leftChildren.length === 0 && isEditing ? (
            <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
              Left column
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {leftChildren.map((b: Block) => <BlockRenderer key={b.id} block={b} isEditing={isEditing} />)}
            </div>
          )}
        </div>
        <div style={{ flex: `0 0 calc(${rightWidth}% - ${gap / 2}px)`, minWidth: "200px" }}>
          {rightChildren.length === 0 && isEditing ? (
            <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
              Right column
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {rightChildren.map((b: Block) => <BlockRenderer key={b.id} block={b} isEditing={isEditing} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

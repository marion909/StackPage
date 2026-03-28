import type { AsymmetricColumnBlock, AsymmetricColumnProps } from "../../types/blocks";
import type { Block } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";

interface Props {
  block: AsymmetricColumnBlock;
  onChange: (p: Partial<AsymmetricColumnProps>) => void;
  isEditing: boolean;
}

const VALIGN_MAP: Record<string, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

export default function AsymmetricColumnBlock({ block, onChange: _onChange, isEditing }: Props) {
  const {
    gap, leftWidth, leftChildren, rightChildren, stackOnMobile,
    backgroundColor, paddingTop, paddingBottom,
    leftVerticalAlign, rightVerticalAlign,
  } = block.props;
  const rightWidth = 100 - leftWidth;

  function renderCol(children: Block[], label: string, align: string) {
    const content = children.length === 0 && isEditing
      ? <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>{label}</div>
      : <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>{children.map((b) => <BlockRenderer key={b.id} block={b} isEditing={isEditing} />)}</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: align }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ display: "flex", flexWrap: stackOnMobile ? "wrap" : "nowrap", gap: `${gap}px`, alignItems: "stretch" }}>
        <div style={{ flex: `0 0 calc(${leftWidth}% - ${gap / 2}px)`, minWidth: "200px" }}>
          {renderCol(leftChildren, "Left column", VALIGN_MAP[leftVerticalAlign ?? "top"])}
        </div>
        <div style={{ flex: `0 0 calc(${rightWidth}% - ${gap / 2}px)`, minWidth: "200px" }}>
          {renderCol(rightChildren, "Right column", VALIGN_MAP[rightVerticalAlign ?? "top"])}
        </div>
      </div>
    </div>
  );
}

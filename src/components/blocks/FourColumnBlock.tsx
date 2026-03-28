import type { FourColumnBlock, FourColumnProps } from "../../types/blocks";
import type { Block } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";

interface Props {
  block: FourColumnBlock;
  onChange: (p: Partial<FourColumnProps>) => void;
  isEditing: boolean;
}

const PLACEHOLDER = (label: string) => (
  <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
    {label}
  </div>
);

export default function FourColumnBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { gap, col1Children, col2Children, col3Children, col4Children, stackOnMobile, backgroundColor, paddingTop, paddingBottom } = block.props;

  function renderCol(children: Block[], label: string) {
    if (children.length === 0 && isEditing) return PLACEHOLDER(label);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {children.map((b) => <BlockRenderer key={b.id} block={b} isEditing={isEditing} />)}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ display: "flex", flexWrap: stackOnMobile ? "wrap" : "nowrap", gap: `${gap}px` }}>
        <div style={{ flex: "1 1 0", minWidth: "150px" }}>{renderCol(col1Children, "Column 1")}</div>
        <div style={{ flex: "1 1 0", minWidth: "150px" }}>{renderCol(col2Children, "Column 2")}</div>
        <div style={{ flex: "1 1 0", minWidth: "150px" }}>{renderCol(col3Children, "Column 3")}</div>
        <div style={{ flex: "1 1 0", minWidth: "150px" }}>{renderCol(col4Children, "Column 4")}</div>
      </div>
    </div>
  );
}

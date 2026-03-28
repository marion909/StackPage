import type { MasonryGridBlock, MasonryGridProps } from "../../types/blocks";
import type { Block } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";

interface Props {
  block: MasonryGridBlock;
  onChange: (p: Partial<MasonryGridProps>) => void;
  isEditing: boolean;
}

export default function MasonryGridBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { columns, gap, backgroundColor, paddingTop, paddingBottom, items } = block.props;

  // Ensure items array has enough column arrays
  const cols: Block[][] = Array.from({ length: columns }, (_, i) => items[i] ?? []);

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px`, alignItems: "start" }}>
        {cols.map((colItems, colIdx) => (
          <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
            {colItems.length === 0 && isEditing ? (
              <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>
                Col {colIdx + 1}
              </div>
            ) : (
              colItems.map((b) => <BlockRenderer key={b.id} block={b} isEditing={isEditing} />)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

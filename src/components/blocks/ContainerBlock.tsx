import type { ContainerBlock, ContainerBlockProps } from "../../types/blocks";
import BlockRenderer from "./BlockRenderer";
import type { Block } from "../../types/blocks";

interface Props {
  block: ContainerBlock;
  onChange: (p: Partial<ContainerBlockProps>) => void;
  isEditing: boolean;
}

export default function ContainerBlock({ block, onChange, isEditing }: Props) {
  const { backgroundColor, paddingTop, paddingBottom, paddingLeft, paddingRight, maxWidth, children } = block.props;

  return (
    <div
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
      }}
    >
      <div style={{ maxWidth: maxWidth ? `${maxWidth}px` : "none", margin: "0 auto" }}>
        {children.length === 0 && isEditing ? (
          <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
            Empty container
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {children.map((child: Block) => (
              <BlockRenderer key={child.id} block={child} isEditing={isEditing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

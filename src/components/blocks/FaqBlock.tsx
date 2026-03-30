import { useState } from "react";
import type { FaqBlock } from "../../types/blocks";

interface Props {
  block: FaqBlock;
  onChange: (props: Partial<FaqBlock["props"]>) => void;
  isEditing: boolean;
}

export default function FaqBlock({ block }: Props) {
  const { headingText, items, accentColor, backgroundColor, textColor, paddingTop, paddingBottom } = block.props;
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor, color: textColor, paddingTop, paddingBottom }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 16px" }}>
        {headingText && (
          <h2 style={{ textAlign: "center", marginBottom: "32px", color: textColor, fontWeight: 700 }}>
            {headingText}
          </h2>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${isOpen ? accentColor : "#e2e8f0"}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isOpen ? accentColor : textColor,
                    textAlign: "left",
                  }}
                >
                  {item.question}
                  <span style={{ flexShrink: 0, marginLeft: 12, transition: "transform 0.2s", transform: isOpen ? "rotate(45deg)" : "none", fontSize: "1.2rem" }}>+</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 20px 16px", color: textColor, opacity: 0.8, lineHeight: 1.7 }}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

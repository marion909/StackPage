import type { TimelineBlock } from "../../types/blocks";

interface Props {
  block: TimelineBlock;
  onChange: (props: Partial<TimelineBlock["props"]>) => void;
  isEditing: boolean;
}

export default function TimelineBlock({ block }: Props) {
  const { items, accentColor, dateColor, textColor, lineColor, align, paddingTop, paddingBottom } = block.props;
  const isCentered = align === "center";

  return (
    <div style={{ color: textColor, paddingTop, paddingBottom }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute",
            left: isCentered ? "50%" : "20px",
            top: 0,
            bottom: 0,
            width: "2px",
            background: lineColor,
            transform: isCentered ? "translateX(-50%)" : undefined,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {items.map((item, idx) => {
              const isLeft = isCentered && idx % 2 === 0;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: isCentered ? (isLeft ? "flex-end" : "flex-start") : "flex-start",
                    paddingLeft: isCentered ? undefined : "52px",
                    position: "relative",
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    position: "absolute",
                    left: isCentered ? "50%" : "12px",
                    top: "6px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: accentColor,
                    border: "3px solid white",
                    boxShadow: `0 0 0 2px ${accentColor}`,
                    transform: isCentered ? "translateX(-50%)" : undefined,
                    zIndex: 1,
                  }} />

                  {/* Card */}
                  <div style={{
                    maxWidth: isCentered ? "45%" : "100%",
                    background: "#f8fafc",
                    border: `1px solid ${lineColor}`,
                    borderRadius: "8px",
                    padding: "16px 20px",
                    marginRight: isCentered && isLeft ? "56%" : undefined,
                    marginLeft: isCentered && !isLeft ? "56%" : undefined,
                  }}>
                    {item.date && (
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: dateColor, marginBottom: "4px" }}>
                        {item.icon && <span style={{ marginRight: "6px" }}>{item.icon}</span>}
                        {item.date}
                      </div>
                    )}
                    <div style={{ fontWeight: 700, color: textColor, marginBottom: "6px" }}>{item.title}</div>
                    <div style={{ fontSize: "0.9rem", color: textColor, opacity: 0.75, lineHeight: 1.6 }}>{item.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

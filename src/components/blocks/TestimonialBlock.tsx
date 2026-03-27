import type { TestimonialBlock } from "../../types/blocks";

interface Props {
  block: TestimonialBlock;
  isEditing?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#d1d5db", fontSize: 16 }}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialBlock({ block }: Props) {
  const { items, columns, backgroundColor, cardColor, quoteColor, authorColor, showRating, paddingTop, paddingBottom } = block.props;

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop, paddingBottom }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 24,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: cardColor,
              borderRadius: 12,
              padding: "28px 24px",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showRating && item.rating > 0 && <StarRating rating={item.rating} />}
            <p style={{ color: quoteColor, fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 20px", flexGrow: 1 }}>
              "{item.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {item.authorAvatar && (
                <img
                  src={item.authorAvatar}
                  alt={item.authorName}
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                />
              )}
              {!item.authorAvatar && (
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%", background: "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#64748b", fontWeight: 700, fontSize: "1rem",
                  }}
                >
                  {item.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ color: authorColor, fontWeight: 700, fontSize: "0.9rem" }}>{item.authorName}</div>
                {item.authorTitle && (
                  <div style={{ color: authorColor, opacity: 0.7, fontSize: "0.8rem" }}>{item.authorTitle}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

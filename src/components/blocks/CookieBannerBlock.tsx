import type { CookieBannerBlock } from "../../types/blocks";

interface Props {
  block: CookieBannerBlock;
  onChange: (props: Partial<CookieBannerBlock["props"]>) => void;
  isEditing: boolean;
}

export default function CookieBannerBlock({ block }: Props) {
  const { message, acceptLabel, declineLabel, backgroundColor, textColor, buttonColor } = block.props;

  return (
    <div
      style={{
        backgroundColor,
        color: textColor,
        padding: "16px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.1)",
        fontSize: "0.875rem",
      }}
    >
      <span style={{ flex: 1, minWidth: "200px" }}>🍪 {message}</span>
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={(e) => e.preventDefault()}
          style={{
            background: "transparent",
            border: `1px solid ${textColor}`,
            color: textColor,
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          {declineLabel}
        </button>
        <button
          onClick={(e) => e.preventDefault()}
          style={{
            background: buttonColor,
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  );
}

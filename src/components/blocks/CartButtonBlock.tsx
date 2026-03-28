import { useThemeStore } from "../../stores/useThemeStore";
import type { CartButtonBlock, CartButtonProps } from "../../types/blocks";

interface Props {
  block: CartButtonBlock;
  onChange: (p: Partial<CartButtonProps>) => void;
  isEditing: boolean;
}

const POSITION_STYLE: Record<string, React.CSSProperties> = {
  "fixed-bottom-right": { position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 },
  "fixed-bottom-left": { position: "fixed", bottom: "24px", left: "24px", zIndex: 1000 },
  inline: { display: "inline-flex" },
};

export default function CartButtonBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { position, backgroundColor, iconColor, label } = block.props;
  const theme = useThemeStore((s) => s.theme);

  const posStyle = isEditing
    ? { display: "inline-flex", margin: "8px" }
    : POSITION_STYLE[position] ?? POSITION_STYLE["fixed-bottom-right"];

  return (
    <div style={posStyle}>
      <button
        id="stackpage-cart-btn"
        style={{
          background: backgroundColor ?? theme.primaryColor,
          color: iconColor ?? "#fff",
          border: "none",
          borderRadius: "50px",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
        onClick={isEditing ? undefined : undefined}
      >
        <span style={{ fontSize: "1.2rem" }}>🛒</span>
        {label && <span>{label}</span>}
        <span id="stackpage-cart-count" style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>0</span>
      </button>
    </div>
  );
}

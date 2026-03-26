import type { ButtonBlock, ButtonBlockProps } from "../../types/blocks";

interface Props {
  block: ButtonBlock;
  onChange: (p: Partial<ButtonBlockProps>) => void;
  isEditing: boolean;
}

const sizeClasses = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export default function ButtonBlock({ block, onChange, isEditing }: Props) {
  const { label, href, variant, align, size } = block.props;

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: isEditing ? "default" : "pointer",
    textDecoration: "none",
    transition: "opacity 0.15s",
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "#2563eb", color: "#ffffff", border: "2px solid #2563eb" },
    secondary: { backgroundColor: "#64748b", color: "#ffffff", border: "2px solid #64748b" },
    outline: { backgroundColor: "transparent", color: "#2563eb", border: "2px solid #2563eb" },
  };

  const alignStyle: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ display: "flex", justifyContent: alignStyle[align] }}>
      {isEditing ? (
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onChange({ label: e.currentTarget.textContent ?? "" })}
          style={{ ...baseStyle, ...variantStyle[variant] }}
          className={sizeClasses[size]}
        >
          {label}
        </span>
      ) : (
        <a href={href} target={block.props.target} style={{ ...baseStyle, ...variantStyle[variant] }} className={sizeClasses[size]}>
          {label}
        </a>
      )}
    </div>
  );
}

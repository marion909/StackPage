import type { ButtonBlock, ButtonBlockProps } from "../../types/blocks";
import { useThemeStore } from "../../stores/useThemeStore";

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
  const theme = useThemeStore((s) => s.theme);

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    borderRadius: `${theme.borderRadius}px`,
    fontWeight: 600,
    cursor: isEditing ? "default" : "pointer",
    textDecoration: "none",
    transition: "opacity 0.15s",
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: theme.primaryColor, color: "#ffffff", border: `2px solid ${theme.primaryColor}` },
    secondary: { backgroundColor: theme.secondaryColor, color: "#ffffff", border: `2px solid ${theme.secondaryColor}` },
    outline: { backgroundColor: "transparent", color: theme.primaryColor, border: `2px solid ${theme.primaryColor}` },
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

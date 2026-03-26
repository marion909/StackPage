import type { TextBlock, TextBlockProps } from "../../types/blocks";

interface Props {
  block: TextBlock;
  onChange: (p: Partial<TextBlockProps>) => void;
  isEditing: boolean;
}

export default function TextBlock({ block, onChange, isEditing }: Props) {
  const { text, align, color, fontSize } = block.props;
  return (
    <p
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={(e) => onChange({ text: e.currentTarget.textContent ?? "" })}
      style={{
        textAlign: align,
        color: color ?? "inherit",
        fontSize: fontSize ? `${fontSize}px` : "1rem",
        margin: 0,
        lineHeight: 1.7,
        outline: "none",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </p>
  );
}

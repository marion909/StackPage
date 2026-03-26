import React, { type ElementType } from "react";
import type { HeadingBlock, HeadingBlockProps } from "../../types/blocks";

interface Props {
  block: HeadingBlock;
  onChange: (p: Partial<HeadingBlockProps>) => void;
  isEditing: boolean;
}

const TAG_MAP: Record<number, ElementType> = {
  1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6",
};

const WEIGHT_MAP: Record<string, string> = {
  normal: "400", semibold: "600", bold: "700", extrabold: "800",
};

export default function HeadingBlock({ block, onChange, isEditing }: Props) {
  const { text, level, align, color, fontSize, fontWeight } = block.props;
  const Tag = TAG_MAP[level] ?? "h2";
  const defaultSizes: Record<number, string> = { 1: "2.5rem", 2: "2rem", 3: "1.5rem", 4: "1.25rem", 5: "1rem", 6: "0.875rem" };

  return (
    <Tag
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => onChange({ text: e.currentTarget.textContent ?? "" })}
      style={{
        textAlign: align,
        color: color ?? "inherit",
        fontSize: fontSize ? `${fontSize}px` : defaultSizes[level],
        fontWeight: fontWeight ? WEIGHT_MAP[fontWeight] : "700",
        margin: 0,
        outline: "none",
      }}
    >
      {text}
    </Tag>
  );
}

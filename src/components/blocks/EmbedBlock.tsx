import type { EmbedBlock } from "../../types/blocks";

interface Props {
  block: EmbedBlock;
  onChange: (props: Partial<EmbedBlock["props"]>) => void;
  isEditing: boolean;
}

export default function EmbedBlock({ block }: Props) {
  const { url, height, title, allowFullscreen, align } = block.props;
  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  if (!url) {
    return (
      <div style={{ padding: "32px", textAlign: "center", background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: "8px", color: "#94a3b8" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⊕</div>
        <div>Paste an embed URL in the properties panel</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align] }}>
      <iframe
        src={url}
        title={title}
        height={height}
        allowFullScreen={allowFullscreen}
        style={{ width: "100%", border: "none", borderRadius: "8px", display: "block" }}
      />
    </div>
  );
}

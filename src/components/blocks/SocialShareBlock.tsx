import type { SocialShareBlock } from "../../types/blocks";

interface Props {
  block: SocialShareBlock;
  onChange: (props: Partial<SocialShareBlock["props"]>) => void;
  isEditing: boolean;
}

const PLATFORM_INFO: Record<string, { label: string; icon: string; hrefFn: (url: string, title: string) => string }> = {
  twitter: { label: "X / Twitter", icon: "𝕏", hrefFn: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  facebook: { label: "Facebook", icon: "f", hrefFn: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  linkedin: { label: "LinkedIn", icon: "in", hrefFn: (u, t) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  whatsapp: { label: "WhatsApp", icon: "📱", hrefFn: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}` },
};

export default function SocialShareBlock({ block }: Props) {
  const { platforms, align, buttonStyle, iconColor, backgroundColor } = block.props;
  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ display: "flex", justifyContent: alignMap[align], flexWrap: "wrap", gap: "10px", padding: "12px 0" }}>
      {platforms.map((p) => {
        const info = PLATFORM_INFO[p];
        if (!info) return null;
        return (
          <a
            key={p}
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor,
              color: iconColor,
              padding: buttonStyle === "icon" ? "8px" : "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              minWidth: buttonStyle === "icon" ? "36px" : undefined,
              justifyContent: "center",
            }}
          >
            <span>{info.icon}</span>
            {buttonStyle !== "icon" && <span>{info.label}</span>}
          </a>
        );
      })}
    </div>
  );
}

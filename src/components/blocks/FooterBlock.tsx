import type { FooterBlock, FooterBlockProps } from "../../types/blocks";

interface Props {
  block: FooterBlock;
  onChange: (p: Partial<FooterBlockProps>) => void;
  isEditing: boolean;
}

export default function FooterBlock({ block, onChange: _onChange, isEditing: _isEditing }: Props) {
  const { companyName, copyrightText, links, backgroundColor, textColor, align, paddingTop, paddingBottom } = block.props;

  return (
    <footer
      style={{
        backgroundColor,
        color: textColor,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        textAlign: align as any,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <p style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>{companyName}</p>
        <nav style={{ display: "flex", gap: "16px", justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start", flexWrap: "wrap", marginBottom: "12px" }}>
          {links.map((link) => (
            <a key={link.id} href={link.href} style={{ color: textColor, textDecoration: "none", fontSize: "0.875rem", opacity: 0.8 }}>
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ fontSize: "0.8rem", opacity: 0.6, margin: 0 }}>{copyrightText}</p>
      </div>
    </footer>
  );
}

import { useThemeStore } from "../../stores/useThemeStore";
import type { PricingTableBlock } from "../../types/blocks";

interface Props {
  block: PricingTableBlock;
  isEditing?: boolean;
}

export default function PricingTableBlock({ block }: Props) {
  const { plans, backgroundColor, paddingTop, paddingBottom } = block.props;
  const theme = useThemeStore((s) => s.theme);
  const radius = `${theme.borderRadius}px`;

  return (
    <div style={{ backgroundColor: backgroundColor ?? "transparent", paddingTop, paddingBottom }}>
      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              flex: "1 1 260px",
              maxWidth: 340,
              background: plan.highlighted ? plan.highlightColor : "#ffffff",
              color: plan.highlighted ? "#ffffff" : "#1e293b",
              borderRadius: 16,
              padding: "32px 28px",
              boxShadow: plan.highlighted
                ? `0 8px 32px ${plan.highlightColor}55`
                : "0 1px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
            }}
          >
            {plan.highlighted && (
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#f59e0b",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 99,
                  whiteSpace: "nowrap",
                }}
              >
                Most Popular
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 800 }}>{plan.price}</span>
              {plan.period && <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>{plan.period}</span>}
            </div>
            {plan.description && (
              <p style={{ fontSize: "0.875rem", opacity: 0.75, margin: "0 0 20px", lineHeight: 1.5 }}>
                {plan.description}
              </p>
            )}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((feat) => (
                <li key={feat.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", opacity: feat.included ? 1 : 0.45 }}>
                  <span style={{ fontSize: 14 }}>{feat.included ? "✓" : "✕"}</span>
                  {feat.text}
                </li>
              ))}
            </ul>
            <a
              href={plan.ctaHref}
              style={{
                marginTop: "auto",
                display: "block",
                textAlign: "center",
                padding: "12px 24px",
                borderRadius: radius,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                background: plan.highlighted ? "rgba(255,255,255,0.2)" : plan.highlightColor,
                color: plan.highlighted ? "#fff" : "#fff",
                border: plan.highlighted ? "2px solid rgba(255,255,255,0.3)" : "none",
              }}
            >
              {plan.ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

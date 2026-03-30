import type { ContactFormBlock, ContactFormProps } from "../../types/blocks";

interface Props {
  block: ContactFormBlock;
  onChange: (p: Partial<ContactFormProps>) => void;
  isEditing: boolean;
}

const MODE_LABELS: Record<string, string> = {
  formspree: "Formspree",
  netlify: "Netlify Forms",
  mailto: "Mailto",
};

export default function ContactFormBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { fields, submitLabel, backgroundColor, paddingTop, paddingBottom, submitMode, formspreeEndpoint, netlifyFormName, recipientEmail, successMessage } = block.props;

  const missingConfig =
    (submitMode === "formspree" && !formspreeEndpoint) ||
    (submitMode === "netlify" && !netlifyFormName) ||
    (submitMode === "mailto" && !recipientEmail);

  return (
    <div
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      {isEditing && (
        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: missingConfig ? "#fff7ed" : "#eff6ff",
            border: `1px solid ${missingConfig ? "#fed7aa" : "#bfdbfe"}`,
            fontSize: "0.8rem",
            color: missingConfig ? "#c2410c" : "#1d4ed8",
          }}
        >
          <span style={{ fontSize: "1rem" }}>{missingConfig ? "⚠️" : "✉️"}</span>
          <span>
            <strong>Submit mode: {MODE_LABELS[submitMode] ?? submitMode}</strong>
            {missingConfig && " — configure the endpoint in Properties →"}
            {!missingConfig && submitMode === "formspree" && ` → ${formspreeEndpoint}`}
            {!missingConfig && submitMode === "netlify" && ` → form name: "${netlifyFormName}"`}
            {!missingConfig && submitMode === "mailto" && ` → ${recipientEmail}`}
          </span>
        </div>
      )}

      <form
        style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}
        data-sp-form
        data-success={successMessage}
        onSubmit={(e) => isEditing && e.preventDefault()}
      >
        {fields.map((field) => (
          <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
              {field.label}
              {field.required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                name={field.id}
                placeholder={field.placeholder ?? field.label}
                rows={4}
                required={field.required}
                disabled={isEditing}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  background: isEditing ? "#f9fafb" : "#ffffff",
                }}
              />
            ) : field.type === "select" ? (
              <select
                name={field.id}
                required={field.required}
                disabled={isEditing}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "0.9rem",
                  background: isEditing ? "#f9fafb" : "#ffffff",
                  width: "100%",
                }}
              >
                <option value="">{field.placeholder ?? "-- Select --"}</option>
                {(field.selectOptions ?? "").split(",").map((o) => o.trim()).filter(Boolean).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.id}
                placeholder={field.placeholder ?? field.label}
                required={field.required}
                disabled={isEditing}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "0.9rem",
                  background: isEditing ? "#f9fafb" : "#ffffff",
                }}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            border: "none",
            cursor: isEditing ? "default" : "pointer",
            fontSize: "1rem",
            alignSelf: "flex-start",
          }}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}

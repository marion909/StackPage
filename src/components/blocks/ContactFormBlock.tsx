import type { ContactFormBlock, ContactFormProps } from "../../types/blocks";

interface Props {
  block: ContactFormBlock;
  onChange: (p: Partial<ContactFormProps>) => void;
  isEditing: boolean;
}

export default function ContactFormBlock({ block, onChange: _onChange, isEditing }: Props) {
  const { fields, submitLabel, backgroundColor, paddingTop, paddingBottom } = block.props;

  return (
    <div
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      <form
        style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}
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
                placeholder={field.placeholder ?? field.label}
                rows={4}
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
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder ?? field.label}
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

import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import type { Section } from "../../../types/project";
import { useProjectStore } from "../../../stores/useProjectStore";

interface Props {
  section: Section;
  pageId: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-medium text-[#64748b] mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    />
  );
}

function ColorInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 border border-[#d1d5db] rounded px-2 py-1 cursor-pointer hover:border-[#2563eb]"
        onClick={() => setOpen(!open)}
      >
        <div
          className="w-5 h-5 rounded border border-[#e2e8f0]"
          style={{ backgroundColor: value || "transparent", backgroundImage: !value ? "repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, #fff 0, #fff 50%)" : undefined, backgroundSize: "6px 6px" }}
        />
        <span className="text-sm text-[#374151]">{value || placeholder || "None"}</span>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl p-3 border border-[#e2e8f0]">
          <HexColorPicker color={value || "#ffffff"} onChange={onChange} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full border border-[#d1d5db] rounded px-2 py-1 text-xs"
            placeholder="#ffffff"
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className="flex-1 text-xs text-[#64748b] hover:bg-[#f1f5f9] py-1 rounded"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 text-xs text-[#2563eb] hover:bg-[#eff6ff] py-1 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SectionPropertiesPanel({ section, pageId }: Props) {
  const updateSection = useProjectStore((s) => s.updateSection);

  function update(updates: Partial<Omit<Section, "id">>) {
    updateSection(pageId, section.id, updates);
  }

  return (
    <div className="p-3">
      <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 px-1">
        Section Settings
      </div>

      <Field label="Background Color">
        <ColorInput value={section.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v || undefined })} placeholder="Inherit" />
      </Field>

      <Field label="Background Image URL">
        <input
          type="text"
          value={section.backgroundImage ?? ""}
          onChange={(e) => update({ backgroundImage: e.target.value || undefined })}
          placeholder="https://..."
          className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
        />
      </Field>

      <Field label="Padding Top (px)">
        <NumberInput value={section.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={300} />
      </Field>
      <Field label="Padding Bottom (px)">
        <NumberInput value={section.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={300} />
      </Field>
      <Field label="Padding Left (px)">
        <NumberInput value={section.paddingLeft} onChange={(v) => update({ paddingLeft: v })} min={0} max={200} />
      </Field>
      <Field label="Padding Right (px)">
        <NumberInput value={section.paddingRight} onChange={(v) => update({ paddingRight: v })} min={0} max={200} />
      </Field>

      <Field label="Max Width (px, 0 = full)">
        <NumberInput value={section.maxWidth ?? 0} onChange={(v) => update({ maxWidth: v || undefined })} min={0} max={2400} />
      </Field>

      <Field label="Full Width">
        <select
          value={String(section.fullWidth)}
          onChange={(e) => update({ fullWidth: e.target.value === "true" })}
          className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb] bg-white"
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </Field>
    </div>
  );
}

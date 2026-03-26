import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import type { Block } from "../../../types/blocks";
import { useProjectStore } from "../../../stores/useProjectStore";

interface Props {
  block: Block;
  pageId: string;
  sectionId: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-medium text-[#64748b] mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    />
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#d1d5db] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb] bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 border border-[#d1d5db] rounded px-2 py-1 cursor-pointer hover:border-[#2563eb]"
        onClick={() => setOpen(!open)}
      >
        <div className="w-5 h-5 rounded border border-[#e2e8f0]" style={{ backgroundColor: value || "#cccccc" }} />
        <span className="text-sm text-[#374151]">{value || "None"}</span>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl p-3 border border-[#e2e8f0]">
          <HexColorPicker color={value || "#000000"} onChange={onChange} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full border border-[#d1d5db] rounded px-2 py-1 text-xs"
            placeholder="#000000"
          />
          <button
            onClick={() => setOpen(false)}
            className="mt-2 w-full text-xs text-[#2563eb] hover:bg-[#eff6ff] py-1 rounded"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

const ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

export default function PropertiesPanel({ block, pageId, sectionId }: Props) {
  const updateBlock = useProjectStore((s) => s.updateBlock);

  function update(props: Record<string, unknown>) {
    updateBlock(pageId, sectionId, block.id, props as Partial<Block["props"]>);
  }

  return (
    <div className="p-3">
      <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 px-1">
        {block.type} block
      </div>

      {block.type === "heading" && (
        <>
          <Field label="Text">
            <TextInput value={block.props.text} onChange={(v) => update({ text: v })} />
          </Field>
          <Field label="Level">
            <Select value={String(block.props.level)} onChange={(v) => update({ level: Number(v) as 1|2|3|4|5|6 })} options={[1,2,3,4,5,6].map(n => ({ label: `H${n}`, value: String(n) }))} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Font Weight">
            <Select value={block.props.fontWeight ?? "bold"} onChange={(v) => update({ fontWeight: v })} options={[{ label: "Normal", value: "normal" }, { label: "Semibold", value: "semibold" }, { label: "Bold", value: "bold" }, { label: "Extrabold", value: "extrabold" }]} />
          </Field>
          <Field label="Font Size (px)">
            <NumberInput value={block.props.fontSize ?? 0} onChange={(v) => update({ fontSize: v || undefined })} min={0} max={200} />
          </Field>
          <Field label="Color">
            <ColorInput value={block.props.color ?? ""} onChange={(v) => update({ color: v })} />
          </Field>
        </>
      )}

      {block.type === "text" && (
        <>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Font Size (px)">
            <NumberInput value={block.props.fontSize ?? 0} onChange={(v) => update({ fontSize: v || undefined })} min={0} max={100} />
          </Field>
          <Field label="Color">
            <ColorInput value={block.props.color ?? ""} onChange={(v) => update({ color: v })} />
          </Field>
        </>
      )}

      {block.type === "button" && (
        <>
          <Field label="Label">
            <TextInput value={block.props.label} onChange={(v) => update({ label: v })} />
          </Field>
          <Field label="Link (href)">
            <TextInput value={block.props.href} onChange={(v) => update({ href: v })} />
          </Field>
          <Field label="Target">
            <Select value={block.props.target} onChange={(v) => update({ target: v })} options={[{ label: "Same tab", value: "_self" }, { label: "New tab", value: "_blank" }]} />
          </Field>
          <Field label="Variant">
            <Select value={block.props.variant} onChange={(v) => update({ variant: v })} options={[{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }, { label: "Outline", value: "outline" }]} />
          </Field>
          <Field label="Size">
            <Select value={block.props.size} onChange={(v) => update({ size: v })} options={[{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }]} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
        </>
      )}

      {block.type === "image" && (
        <>
          <Field label="Image URL">
            <TextInput value={block.props.src} onChange={(v) => update({ src: v })} />
          </Field>
          <Field label="Alt Text">
            <TextInput value={block.props.alt} onChange={(v) => update({ alt: v })} />
          </Field>
          <Field label="Caption">
            <TextInput value={block.props.caption ?? ""} onChange={(v) => update({ caption: v })} />
          </Field>
          <Field label="Width (%)">
            <NumberInput value={block.props.width} onChange={(v) => update({ width: v })} min={10} max={100} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Object Fit">
            <Select value={block.props.objectFit} onChange={(v) => update({ objectFit: v })} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }]} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v })} min={0} max={100} />
          </Field>
        </>
      )}

      {block.type === "navigation" && (
        <>
          <Field label="Logo Text">
            <TextInput value={block.props.logoText} onChange={(v) => update({ logoText: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Text Color">
            <ColorInput value={block.props.textColor} onChange={(v) => update({ textColor: v })} />
          </Field>
          <Field label="Sticky">
            <Select value={String(block.props.sticky)} onChange={(v) => update({ sticky: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>
        </>
      )}

      {block.type === "footer" && (
        <>
          <Field label="Company Name">
            <TextInput value={block.props.companyName} onChange={(v) => update({ companyName: v })} />
          </Field>
          <Field label="Copyright Text">
            <TextInput value={block.props.copyrightText} onChange={(v) => update({ copyrightText: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Text Color">
            <ColorInput value={block.props.textColor} onChange={(v) => update({ textColor: v })} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
        </>
      )}

      {block.type === "contact-form" && (
        <>
          <Field label="Submit Button Label">
            <TextInput value={block.props.submitLabel} onChange={(v) => update({ submitLabel: v })} />
          </Field>
          <Field label="Success Message">
            <TextInput value={block.props.successMessage} onChange={(v) => update({ successMessage: v })} />
          </Field>
          <Field label="Recipient Email">
            <TextInput value={block.props.recipientEmail ?? ""} onChange={(v) => update({ recipientEmail: v })} />
          </Field>
        </>
      )}

      {(block.type === "container" || block.type === "two-column" || block.type === "three-column") && (
        <>
          <Field label="Background Color">
            <ColorInput value={(block.props as any).backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Padding Top">
            <NumberInput value={(block.props as any).paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={300} />
          </Field>
          <Field label="Padding Bottom">
            <NumberInput value={(block.props as any).paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={300} />
          </Field>
          {block.type === "two-column" && (
            <Field label="Left Column Width (%)">
              <NumberInput value={block.props.leftWidth} onChange={(v) => update({ leftWidth: v })} min={10} max={90} />
            </Field>
          )}
        </>
      )}

      {block.type === "gallery" && (
        <>
          <Field label="Columns">
            <Select value={String(block.props.columns)} onChange={(v) => update({ columns: Number(v) as 2|3|4 })} options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]} />
          </Field>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={64} />
          </Field>
          <Field label="Show Captions">
            <Select value={String(block.props.showCaptions)} onChange={(v) => update({ showCaptions: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>
        </>
      )}
    </div>
  );
}

import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import type { Block, GalleryImage, NavLink, FooterLink, FormField, SlideItem, TestimonialItem, PricingPlan, PricingFeature, ProductCardItem } from "../../../types/blocks";
import { ICON_NAMES } from "../../blocks/IconBlock";
import { useProjectStore } from "../../../stores/useProjectStore";
import { nanoid } from "../../../types/nanoid";

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
  const patchBlock = useProjectStore((s) => s.patchBlock);
  const theme = useProjectStore((s) => s.project?.theme);

  function update(props: Record<string, unknown>) {
    updateBlock(pageId, sectionId, block.id, props as Partial<Block["props"]>);
  }

  return (
    <div className="p-3">
      <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 px-1">
        {block.type} block
      </div>

      {/* ── Universal: Corner Radius ── */}
      <Field label="Corner Radius (px)">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={64}
            value={block.cornerRadius ?? theme?.borderRadius ?? 8}
            onChange={(e) => patchBlock(pageId, sectionId, block.id, { cornerRadius: Number(e.target.value) })}
            className="flex-1 accent-[#2563eb]"
          />
          <span className="text-xs text-[#374151] w-8 text-right">{block.cornerRadius ?? theme?.borderRadius ?? 8}px</span>
          {block.cornerRadius !== undefined && (
            <button
              onClick={() => patchBlock(pageId, sectionId, block.id, { cornerRadius: undefined })}
              className="text-[10px] text-[#94a3b8] hover:text-[#374151]"
              title="Reset to theme default"
            >↺</button>
          )}
        </div>
      </Field>
      <div className="border-b border-[#f1f5f9] mb-3" />

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
          {block.props.src && !block.props.alt && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span>⚠</span>
              <span>Image is missing alt text (accessibility)</span>
            </div>
          )}
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

          {/* Nav links */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Links</span>
              <button
                onClick={() => {
                  const link: NavLink = { id: nanoid(), label: "Link", href: "#" };
                  update({ links: [...block.props.links, link] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1.5">
              {block.props.links.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">No links yet.</p>
              )}
              {block.props.links.map((link, idx) => (
                <div key={link.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[#374151]">Link {idx + 1}</span>
                    <button
                      onClick={() => update({ links: block.props.links.filter((_, i) => i !== idx) })}
                      className="text-[11px] text-[#ef4444] hover:underline"
                    >Remove</button>
                  </div>
                  <input
                    type="text" placeholder="Label" value={link.label}
                    onChange={(e) => update({ links: block.props.links.map((l, i) => i === idx ? { ...l, label: e.target.value } : l) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <input
                    type="text" placeholder="URL (e.g. #about or /about.html)" value={link.href}
                    onChange={(e) => update({ links: block.props.links.map((l, i) => i === idx ? { ...l, href: e.target.value } : l) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                </div>
              ))}
            </div>
          </div>
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

          {/* Footer links */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Links</span>
              <button
                onClick={() => {
                  const link: FooterLink = { id: nanoid(), label: "Link", href: "#" };
                  update({ links: [...block.props.links, link] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-1.5">
              {block.props.links.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">No links yet.</p>
              )}
              {block.props.links.map((link, idx) => (
                <div key={link.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[#374151]">Link {idx + 1}</span>
                    <button
                      onClick={() => update({ links: block.props.links.filter((_, i) => i !== idx) })}
                      className="text-[11px] text-[#ef4444] hover:underline"
                    >Remove</button>
                  </div>
                  <input
                    type="text" placeholder="Label" value={link.label}
                    onChange={(e) => update({ links: block.props.links.map((l, i) => i === idx ? { ...l, label: e.target.value } : l) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <input
                    type="text" placeholder="URL" value={link.href}
                    onChange={(e) => update({ links: block.props.links.map((l, i) => i === idx ? { ...l, href: e.target.value } : l) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "contact-form" && (
        <>
          <Field label="Submit Mode">
            <Select
              value={block.props.submitMode ?? "formspree"}
              onChange={(v) => update({ submitMode: v })}
              options={[
                { label: "Formspree (recommended)", value: "formspree" },
                { label: "Netlify Forms", value: "netlify" },
                { label: "Mailto (opens email client)", value: "mailto" },
              ]}
            />
          </Field>

          {(block.props.submitMode ?? "formspree") === "formspree" && (
            <>
              <Field label="Formspree Endpoint URL">
                <TextInput
                  value={block.props.formspreeEndpoint ?? ""}
                  onChange={(v) => update({ formspreeEndpoint: v })}
                />
              </Field>
              <div className="mb-3 text-[11px] text-[#64748b] leading-relaxed">
                Create a free form at{" "}
                <a href="https://formspree.io" target="_blank" rel="noreferrer" className="text-[#2563eb] underline">
                  formspree.io
                </a>{" "}
                and paste the endpoint URL (e.g. <code className="bg-[#f1f5f9] px-1 rounded">https://formspree.io/f/xxxxx</code>).
              </div>
            </>
          )}

          {block.props.submitMode === "netlify" && (
            <>
              <Field label="Netlify Form Name">
                <TextInput
                  value={block.props.netlifyFormName ?? "contact"}
                  onChange={(v) => update({ netlifyFormName: v })}
                />
              </Field>
              <div className="mb-3 text-[11px] text-[#64748b] leading-relaxed">
                Deploy to Netlify and enable form detection in your site dashboard. The form name must be unique per site.
              </div>
            </>
          )}

          {block.props.submitMode === "mailto" && (
            <Field label="Recipient Email">
              <TextInput value={block.props.recipientEmail ?? ""} onChange={(v) => update({ recipientEmail: v })} />
            </Field>
          )}

          <Field label="Submit Button Label">
            <TextInput value={block.props.submitLabel} onChange={(v) => update({ submitLabel: v })} />
          </Field>
          <Field label="Success Message">
            <TextInput value={block.props.successMessage} onChange={(v) => update({ successMessage: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>

          {/* Form fields */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Form Fields</span>
              <button
                onClick={() => {
                  const field: FormField = { id: nanoid(), label: "Field", type: "text", placeholder: "", required: false };
                  update({ fields: [...block.props.fields, field] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {block.props.fields.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">No fields yet.</p>
              )}
              {block.props.fields.map((field, idx) => (
                <div key={field.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[#374151]">Field {idx + 1}</span>
                    <button
                      onClick={() => update({ fields: block.props.fields.filter((_, i) => i !== idx) })}
                      className="text-[11px] text-[#ef4444] hover:underline"
                    >Remove</button>
                  </div>
                  <input
                    type="text" placeholder="Label" value={field.label}
                    onChange={(e) => update({ fields: block.props.fields.map((f, i) => i === idx ? { ...f, label: e.target.value } : f) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <input
                    type="text" placeholder="Placeholder" value={field.placeholder ?? ""}
                    onChange={(e) => update({ fields: block.props.fields.map((f, i) => i === idx ? { ...f, placeholder: e.target.value } : f) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={field.type}
                      onChange={(e) => update({ fields: block.props.fields.map((f, i) => i === idx ? { ...f, type: e.target.value as FormField["type"] } : f) })}
                      className="flex-1 border border-[#d1d5db] rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <label className="flex items-center gap-1 text-[11px] text-[#374151] cursor-pointer">
                      <input
                        type="checkbox" checked={field.required}
                        onChange={(e) => update({ fields: block.props.fields.map((f, i) => i === idx ? { ...f, required: e.target.checked } : f) })}
                        className="rounded"
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v || undefined })} min={0} max={50} />
          </Field>

          {/* Image list */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Images</span>
              <button
                onClick={() => {
                  const newImage: GalleryImage = { id: nanoid(), src: "", alt: "", caption: "" };
                  update({ images: [...block.props.images, newImage] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {block.props.images.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">No images yet. Click + Add.</p>
              )}
              {block.props.images.map((img, idx) => (
                <div key={img.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-[#374151]">Image {idx + 1}</span>
                    <button
                      onClick={() => update({ images: block.props.images.filter((_, i) => i !== idx) })}
                      className="text-[11px] text-[#ef4444] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={img.src}
                    onChange={(e) => {
                      const updated = block.props.images.map((im, i) => i === idx ? { ...im, src: e.target.value } : im);
                      update({ images: updated });
                    }}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={img.alt}
                    onChange={(e) => {
                      const updated = block.props.images.map((im, i) => i === idx ? { ...im, alt: e.target.value } : im);
                      update({ images: updated });
                    }}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  {block.props.showCaptions && (
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={img.caption ?? ""}
                      onChange={(e) => {
                        const updated = block.props.images.map((im, i) => i === idx ? { ...im, caption: e.target.value } : im);
                        update({ images: updated });
                      }}
                      className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "slide-banner" && (
        <>
          <Field label="Height (px)">
            <NumberInput value={block.props.height} onChange={(v) => update({ height: v })} min={200} max={900} />
          </Field>
          <Field label="Object Fit">
            <Select value={block.props.objectFit} onChange={(v) => update({ objectFit: v as "cover"|"contain"|"fill" })} options={[{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }, { label: "Fill", value: "fill" }]} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v || undefined })} min={0} max={50} />
          </Field>
          <Field label="Autoplay">
            <Select value={String(block.props.autoplay)} onChange={(v) => update({ autoplay: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>
          {block.props.autoplay && (
            <Field label="Autoplay Interval (ms)">
              <NumberInput value={block.props.autoplayInterval} onChange={(v) => update({ autoplayInterval: v })} min={1000} max={10000} step={500} />
            </Field>
          )}
          <Field label="Show Arrows">
            <Select value={String(block.props.showArrows)} onChange={(v) => update({ showArrows: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>
          <Field label="Show Indicators">
            <Select value={String(block.props.showIndicators)} onChange={(v) => update({ showIndicators: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>

          {/* Slides list */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Slides</span>
              <button
                onClick={() => {
                  const slide: SlideItem = { id: nanoid(), imageSrc: "", imageAlt: "", title: "New Slide", subtitle: "", ctaLabel: "", ctaHref: "#", overlayColor: "rgba(0,0,0,0.35)", titleColor: "#ffffff", subtitleColor: "#f1f5f9" };
                  update({ slides: [...block.props.slides, slide] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {block.props.slides.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">No slides yet. Click + Add.</p>
              )}
              {block.props.slides.map((slide, idx) => (
                <div key={slide.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#374151]">Slide {idx + 1}</span>
                    <button onClick={() => update({ slides: block.props.slides.filter((_, i) => i !== idx) })} className="text-[11px] text-[#ef4444] hover:underline">Remove</button>
                  </div>
                  <input type="text" placeholder="Image URL" value={slide.imageSrc}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, imageSrc: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="Alt text" value={slide.imageAlt}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, imageAlt: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="Title" value={slide.title ?? ""}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, title: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="Subtitle" value={slide.subtitle ?? ""}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="CTA Label" value={slide.ctaLabel ?? ""}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, ctaLabel: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="CTA Link" value={slide.ctaHref ?? ""}
                    onChange={(e) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, ctaHref: e.target.value } : s) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    <div>
                      <p className="text-[10px] text-[#94a3b8] mb-0.5">Overlay</p>
                      <ColorInput value={slide.overlayColor ?? "rgba(0,0,0,0.35)"} onChange={(v) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, overlayColor: v } : s) })} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94a3b8] mb-0.5">Title</p>
                      <ColorInput value={slide.titleColor ?? "#ffffff"} onChange={(v) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, titleColor: v } : s) })} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94a3b8] mb-0.5">Subtitle</p>
                      <ColorInput value={slide.subtitleColor ?? "#f1f5f9"} onChange={(v) => update({ slides: block.props.slides.map((s, i) => i === idx ? { ...s, subtitleColor: v } : s) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "divider" && (
        <>
          <Field label="Variant">
            <Select value={block.props.variant} onChange={(v) => update({ variant: v })} options={[{ label: "Rule (line)", value: "rule" }, { label: "Spacer (empty)", value: "spacer" }]} />
          </Field>
          <Field label={block.props.variant === "spacer" ? "Height (px)" : "Thickness (px)"}>
            <NumberInput value={block.props.height} onChange={(v) => update({ height: v })} min={1} max={200} />
          </Field>
          {block.props.variant === "rule" && (
            <>
              <Field label="Line Style">
                <Select value={block.props.lineStyle} onChange={(v) => update({ lineStyle: v })} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} />
              </Field>
              <Field label="Color">
                <ColorInput value={block.props.color} onChange={(v) => update({ color: v })} />
              </Field>
              <Field label="Width (%)">
                <NumberInput value={block.props.width} onChange={(v) => update({ width: v })} min={10} max={100} />
              </Field>
            </>
          )}
          <Field label="Margin Top (px)">
            <NumberInput value={block.props.marginTop} onChange={(v) => update({ marginTop: v })} min={0} max={200} />
          </Field>
          <Field label="Margin Bottom (px)">
            <NumberInput value={block.props.marginBottom} onChange={(v) => update({ marginBottom: v })} min={0} max={200} />
          </Field>
        </>
      )}

      {block.type === "video" && (
        <>
          <Field label="Video URL">
            <TextInput value={block.props.url} onChange={(v) => update({ url: v })} />
          </Field>
          <Field label="Video Type">
            <Select value={block.props.videoType} onChange={(v) => update({ videoType: v })} options={[{ label: "YouTube", value: "youtube" }, { label: "Vimeo", value: "vimeo" }, { label: "Direct (.mp4)", value: "direct" }]} />
          </Field>
          <Field label="Aspect Ratio">
            <Select value={block.props.aspectRatio} onChange={(v) => update({ aspectRatio: v })} options={[{ label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1 (Square)", value: "1/1" }]} />
          </Field>
          <Field label="Width (%)">
            <NumberInput value={block.props.width} onChange={(v) => update({ width: v })} min={10} max={100} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v || undefined })} min={0} max={24} />
          </Field>
          {block.props.videoType === "direct" && (
            <>
              <Field label="Show Controls">
                <Select value={String(block.props.controls)} onChange={(v) => update({ controls: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
              </Field>
              <Field label="Autoplay">
                <Select value={String(block.props.autoplay)} onChange={(v) => update({ autoplay: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
              </Field>
              <Field label="Muted">
                <Select value={String(block.props.muted)} onChange={(v) => update({ muted: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
              </Field>
              <Field label="Loop">
                <Select value={String(block.props.loop)} onChange={(v) => update({ loop: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
              </Field>
            </>
          )}
        </>
      )}

      {block.type === "hero" && (
        <>
          <Field label="Heading">
            <TextInput value={block.props.heading} onChange={(v) => update({ heading: v })} />
          </Field>
          <Field label="Subheading">
            <TextInput value={block.props.subheading} onChange={(v) => update({ subheading: v })} />
          </Field>
          <Field label="CTA Label">
            <TextInput value={block.props.ctaLabel} onChange={(v) => update({ ctaLabel: v })} />
          </Field>
          <Field label="CTA Link">
            <TextInput value={block.props.ctaHref} onChange={(v) => update({ ctaHref: v })} />
          </Field>
          <Field label="CTA Style">
            <Select value={block.props.ctaVariant} onChange={(v) => update({ ctaVariant: v })} options={[{ label: "Primary", value: "primary" }, { label: "Secondary", value: "secondary" }, { label: "Outline", value: "outline" }]} />
          </Field>
          <Field label="Secondary CTA Label">
            <TextInput value={block.props.ctaSecondaryLabel} onChange={(v) => update({ ctaSecondaryLabel: v })} />
          </Field>
          <Field label="Secondary CTA Link">
            <TextInput value={block.props.ctaSecondaryHref} onChange={(v) => update({ ctaSecondaryHref: v })} />
          </Field>
          <Field label="Background Image URL">
            <TextInput value={block.props.backgroundImage} onChange={(v) => update({ backgroundImage: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Overlay Color">
            <ColorInput value={block.props.overlayColor} onChange={(v) => update({ overlayColor: v })} />
          </Field>
          <Field label="Heading Color">
            <ColorInput value={block.props.headingColor} onChange={(v) => update({ headingColor: v })} />
          </Field>
          <Field label="Subheading Color">
            <ColorInput value={block.props.subheadingColor} onChange={(v) => update({ subheadingColor: v })} />
          </Field>
          <Field label="Text Align">
            <Select value={block.props.textAlign} onChange={(v) => update({ textAlign: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Min Height (px)">
            <NumberInput value={block.props.minHeight} onChange={(v) => update({ minHeight: v })} min={200} max={1000} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={300} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={300} />
          </Field>
        </>
      )}

      {block.type === "testimonial" && (
        <>
          <Field label="Columns">
            <Select value={String(block.props.columns)} onChange={(v) => update({ columns: Number(v) as 1|2|3 })} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }]} />
          </Field>
          <Field label="Show Rating">
            <Select value={String(block.props.showRating)} onChange={(v) => update({ showRating: v === "true" })} options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
          </Field>
          <Field label="Card Color">
            <ColorInput value={block.props.cardColor} onChange={(v) => update({ cardColor: v })} />
          </Field>
          <Field label="Quote Color">
            <ColorInput value={block.props.quoteColor} onChange={(v) => update({ quoteColor: v })} />
          </Field>
          <Field label="Author Color">
            <ColorInput value={block.props.authorColor} onChange={(v) => update({ authorColor: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v || undefined })} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>

          {/* Testimonial items */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Testimonials</span>
              <button
                onClick={() => {
                  const item: TestimonialItem = { id: nanoid(), quote: "Great product!", authorName: "John Doe", authorTitle: "", authorAvatar: "", rating: 5 };
                  update({ items: [...block.props.items, item] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >+ Add</button>
            </div>
            <div className="space-y-2">
              {block.props.items.map((item, idx) => (
                <div key={item.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#374151]">Item {idx + 1}</span>
                    <button onClick={() => update({ items: block.props.items.filter((_, i) => i !== idx) })} className="text-[11px] text-[#ef4444] hover:underline">Remove</button>
                  </div>
                  <textarea
                    placeholder="Quote" value={item.quote} rows={3}
                    onChange={(e) => update({ items: block.props.items.map((t, i) => i === idx ? { ...t, quote: e.target.value } : t) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb] resize-none"
                  />
                  <input type="text" placeholder="Author Name" value={item.authorName}
                    onChange={(e) => update({ items: block.props.items.map((t, i) => i === idx ? { ...t, authorName: e.target.value } : t) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="Title (optional)" value={item.authorTitle}
                    onChange={(e) => update({ items: block.props.items.map((t, i) => i === idx ? { ...t, authorTitle: e.target.value } : t) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  <input type="text" placeholder="Avatar URL (optional)" value={item.authorAvatar}
                    onChange={(e) => update({ items: block.props.items.map((t, i) => i === idx ? { ...t, authorAvatar: e.target.value } : t) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-[#2563eb]" />
                  {block.props.showRating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[11px] text-[#64748b]">Stars:</span>
                      {[1,2,3,4,5].map((n) => (
                        <button key={n} onClick={() => update({ items: block.props.items.map((t, i) => i === idx ? { ...t, rating: n } : t) })}
                          className={`text-base ${n <= item.rating ? "text-amber-400" : "text-[#d1d5db]"}`}>★</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "pricing-table" && (
        <>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v || undefined })} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>

          {/* Plans */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="block text-[11px] font-medium text-[#64748b] uppercase tracking-wide">Plans</span>
              <button
                onClick={() => {
                  const plan: PricingPlan = { id: nanoid(), name: "New Plan", price: "$0", period: "/mo", description: "", features: [{ id: nanoid(), text: "Feature", included: true }], ctaLabel: "Get Started", ctaHref: "#", highlighted: false, highlightColor: "#2563eb" };
                  update({ plans: [...block.props.plans, plan] });
                }}
                className="text-[11px] text-[#2563eb] hover:underline font-medium"
              >+ Add</button>
            </div>
            <div className="space-y-3">
              {block.props.plans.map((plan, pIdx) => (
                <div key={plan.id} className="border border-[#e2e8f0] rounded p-2 bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#374151]">Plan {pIdx + 1}</span>
                    <button onClick={() => update({ plans: block.props.plans.filter((_, i) => i !== pIdx) })} className="text-[11px] text-[#ef4444] hover:underline">Remove</button>
                  </div>
                  <input type="text" placeholder="Name" value={plan.name}
                    onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, name: e.target.value } : p) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <input type="text" placeholder="Price (e.g. $9)" value={plan.price}
                      onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, price: e.target.value } : p) })}
                      className="border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none" />
                    <input type="text" placeholder="Period (e.g. /mo)" value={plan.period}
                      onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, period: e.target.value } : p) })}
                      className="border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none" />
                  </div>
                  <input type="text" placeholder="Description" value={plan.description}
                    onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, description: e.target.value } : p) })}
                    className="w-full border border-[#d1d5db] rounded px-2 py-1 text-xs mb-1 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <input type="text" placeholder="CTA Label" value={plan.ctaLabel}
                      onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, ctaLabel: e.target.value } : p) })}
                      className="border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none" />
                    <input type="text" placeholder="CTA Link" value={plan.ctaHref}
                      onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, ctaHref: e.target.value } : p) })}
                      className="border border-[#d1d5db] rounded px-2 py-1 text-xs focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input type="checkbox" checked={plan.highlighted}
                        onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, highlighted: e.target.checked } : p) })} />
                      Highlighted
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#64748b]">Color</span>
                      <ColorInput value={plan.highlightColor} onChange={(v) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, highlightColor: v } : p) })} />
                    </div>
                  </div>
                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#94a3b8] uppercase">Features</span>
                      <button
                        onClick={() => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, features: [...p.features, { id: nanoid(), text: "New feature", included: true } as PricingFeature] } : p) })}
                        className="text-[10px] text-[#2563eb] hover:underline"
                      >+ Add</button>
                    </div>
                    <div className="space-y-1">
                      {plan.features.map((feat, fIdx) => (
                        <div key={feat.id} className="flex items-center gap-1">
                          <input type="checkbox" checked={feat.included}
                            onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, features: p.features.map((f, j) => j === fIdx ? { ...f, included: e.target.checked } : f) } : p) })} />
                          <input type="text" value={feat.text}
                            onChange={(e) => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, features: p.features.map((f, j) => j === fIdx ? { ...f, text: e.target.value } : f) } : p) })}
                            className="flex-1 border border-[#d1d5db] rounded px-1 py-0.5 text-xs focus:outline-none" />
                          <button onClick={() => update({ plans: block.props.plans.map((p, i) => i === pIdx ? { ...p, features: p.features.filter((_, j) => j !== fIdx) } : p) })}
                            className="text-[10px] text-[#ef4444]">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "icon" && (
        <>
          <Field label="Icon">
            <Select
              value={block.props.iconName}
              onChange={(v) => update({ iconName: v })}
              options={ICON_NAMES.map((n) => ({ label: n.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: n }))}
            />
          </Field>
          <Field label="Size (px)">
            <NumberInput value={block.props.size} onChange={(v) => update({ size: v })} min={16} max={200} />
          </Field>
          <Field label="Color">
            <ColorInput value={block.props.color} onChange={(v) => update({ color: v })} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Label">
            <TextInput value={block.props.label} onChange={(v) => update({ label: v })} />
          </Field>
          {block.props.label && (
            <Field label="Label Color">
              <ColorInput value={block.props.labelColor} onChange={(v) => update({ labelColor: v })} />
            </Field>
          )}
          <Field label="Link (optional)">
            <TextInput value={block.props.href} onChange={(v) => update({ href: v })} />
          </Field>
        </>
      )}

      {block.type === "map" && (
        <>
          <Field label="Embed URL">
            <TextInput value={block.props.embedUrl} onChange={(v) => update({ embedUrl: v })} />
          </Field>
          <div className="mb-2 text-[11px] text-[#64748b]">
            Paste an OpenStreetMap or Google Maps embed URL.<br />
            For Google Maps: Share → Embed → copy the src attribute.
          </div>
          <Field label="Height (px)">
            <NumberInput value={block.props.height} onChange={(v) => update({ height: v })} min={200} max={800} />
          </Field>
          <Field label="Width (%)">
            <NumberInput value={block.props.width} onChange={(v) => update({ width: v })} min={10} max={100} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align} onChange={(v) => update({ align: v })} options={ALIGN_OPTIONS} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v || undefined })} min={0} max={32} />
          </Field>
        </>
      )}

      {block.type === "four-column" && (
        <>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={80} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
        </>
      )}

      {block.type === "asymmetric-column" && (
        <>
          <Field label="Left Column Width (%)">
            <NumberInput value={block.props.leftWidth} onChange={(v) => update({ leftWidth: v })} min={20} max={80} />
          </Field>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={80} />
          </Field>
          <Field label="Left Vertical Align">
            <Select value={block.props.leftVerticalAlign ?? "top"} onChange={(v) => update({ leftVerticalAlign: v })} options={[{ label: "Top", value: "top" }, { label: "Center", value: "center" }, { label: "Bottom", value: "bottom" }]} />
          </Field>
          <Field label="Right Vertical Align">
            <Select value={block.props.rightVerticalAlign ?? "top"} onChange={(v) => update({ rightVerticalAlign: v })} options={[{ label: "Top", value: "top" }, { label: "Center", value: "center" }, { label: "Bottom", value: "bottom" }]} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
        </>
      )}

      {block.type === "vertical-stack" && (
        <>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={80} />
          </Field>
          <Field label="Align">
            <Select value={block.props.align ?? "stretch"} onChange={(v) => update({ align: v })} options={[{ label: "Stretch", value: "stretch" }, { label: "Start", value: "start" }, { label: "Center", value: "center" }, { label: "End", value: "end" }]} />
          </Field>
          <Field label="Show Divider">
            <input type="checkbox" checked={block.props.showDivider ?? false} onChange={(e) => update({ showDivider: e.target.checked })} />
          </Field>
          {block.props.showDivider && (
            <Field label="Divider Color">
              <ColorInput value={block.props.dividerColor ?? "#e2e8f0"} onChange={(v) => update({ dividerColor: v })} />
            </Field>
          )}
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Left (px)">
            <NumberInput value={block.props.paddingLeft} onChange={(v) => update({ paddingLeft: v })} min={0} max={100} />
          </Field>
          <Field label="Padding Right (px)">
            <NumberInput value={block.props.paddingRight} onChange={(v) => update({ paddingRight: v })} min={0} max={100} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
        </>
      )}

      {block.type === "masonry-grid" && (
        <>
          <Field label="Columns">
            <NumberInput value={block.props.columns} onChange={(v) => update({ columns: v })} min={2} max={5} />
          </Field>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={60} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
        </>
      )}

      {block.type === "product-card" && (
        <>
          <Field label="Product Name">
            <TextInput value={block.props.name} onChange={(v) => update({ name: v })} />
          </Field>
          <Field label="Description">
            <TextInput value={block.props.description ?? ""} onChange={(v) => update({ description: v })} />
          </Field>
          <Field label="Price">
            <TextInput value={block.props.price} onChange={(v) => update({ price: v })} />
          </Field>
          <Field label="Badge (optional)">
            <TextInput value={block.props.badge ?? ""} onChange={(v) => update({ badge: v || undefined })} />
          </Field>
          <Field label="Image URL">
            <TextInput value={block.props.imageSrc ?? ""} onChange={(v) => update({ imageSrc: v })} />
          </Field>
          <Field label="Image Alt">
            <TextInput value={block.props.imageAlt ?? ""} onChange={(v) => update({ imageAlt: v })} />
          </Field>
          <Field label="Button Label">
            <TextInput value={block.props.ctaLabel ?? ""} onChange={(v) => update({ ctaLabel: v })} />
          </Field>
          <Field label="Button Link">
            <TextInput value={block.props.ctaHref ?? ""} onChange={(v) => update({ ctaHref: v })} />
          </Field>
          <Field label="Button Target">
            <Select value={block.props.ctaTarget ?? "_self"} onChange={(v) => update({ ctaTarget: v })} options={[{ label: "Same tab", value: "_self" }, { label: "New tab", value: "_blank" }]} />
          </Field>
          <Field label="Shadow">
            <input type="checkbox" checked={block.props.shadow ?? true} onChange={(e) => update({ shadow: e.target.checked })} />
          </Field>
          <Field label="Outlined">
            <input type="checkbox" checked={block.props.outlined ?? false} onChange={(e) => update({ outlined: e.target.checked })} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 12} onChange={(v) => update({ borderRadius: v })} min={0} max={48} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? "#ffffff"} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop ?? 16} onChange={(v) => update({ paddingTop: v })} min={0} max={100} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom ?? 16} onChange={(v) => update({ paddingBottom: v })} min={0} max={100} />
          </Field>
        </>
      )}

      {block.type === "product-grid" && (
        <>
          <Field label="Columns">
            <NumberInput value={block.props.columns} onChange={(v) => update({ columns: v })} min={2} max={4} />
          </Field>
          <Field label="Gap (px)">
            <NumberInput value={block.props.gap} onChange={(v) => update({ gap: v })} min={0} max={60} />
          </Field>
          <Field label="Card Style">
            <Select value={block.props.cardStyle ?? "shadowed"} onChange={(v) => update({ cardStyle: v })} options={[{ label: "Shadowed", value: "shadowed" }, { label: "Outlined", value: "outlined" }, { label: "Flat", value: "flat" }]} />
          </Field>
          <Field label="Border Radius (px)">
            <NumberInput value={block.props.borderRadius ?? 12} onChange={(v) => update({ borderRadius: v })} min={0} max={48} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? ""} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Products</span>
              <button
                onClick={() => update({ items: [...block.props.items, { id: nanoid(), name: "Product", description: "", price: "$0.00", imageSrc: "", imageAlt: "", badge: "", ctaLabel: "Buy Now", ctaHref: "#", ctaTarget: "_self" } as ProductCardItem] })}
                className="text-[10px] text-[#2563eb] hover:underline"
              >+ Add</button>
            </div>
            <div className="space-y-3">
              {block.props.items.map((item: ProductCardItem, idx: number) => (
                <div key={item.id} className="border border-[#e2e8f0] rounded p-2 space-y-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-[#374151]">Item {idx + 1}</span>
                    <button onClick={() => update({ items: block.props.items.filter((_: ProductCardItem, i: number) => i !== idx) })} className="text-[10px] text-[#ef4444]">Remove</button>
                  </div>
                  <input type="text" placeholder="Name" value={item.name} onChange={(e) => update({ items: block.props.items.map((it: ProductCardItem, i: number) => i === idx ? { ...it, name: e.target.value } : it) })} className="w-full border border-[#d1d5db] rounded px-1 py-0.5 text-xs" />
                  <input type="text" placeholder="Price" value={item.price} onChange={(e) => update({ items: block.props.items.map((it: ProductCardItem, i: number) => i === idx ? { ...it, price: e.target.value } : it) })} className="w-full border border-[#d1d5db] rounded px-1 py-0.5 text-xs" />
                  <input type="text" placeholder="Image URL" value={item.imageSrc} onChange={(e) => update({ items: block.props.items.map((it: ProductCardItem, i: number) => i === idx ? { ...it, imageSrc: e.target.value } : it) })} className="w-full border border-[#d1d5db] rounded px-1 py-0.5 text-xs" />
                  <input type="text" placeholder="Button label" value={item.ctaLabel} onChange={(e) => update({ items: block.props.items.map((it: ProductCardItem, i: number) => i === idx ? { ...it, ctaLabel: e.target.value } : it) })} className="w-full border border-[#d1d5db] rounded px-1 py-0.5 text-xs" />
                  <input type="text" placeholder="Button link" value={item.ctaHref} onChange={(e) => update({ items: block.props.items.map((it: ProductCardItem, i: number) => i === idx ? { ...it, ctaHref: e.target.value } : it) })} className="w-full border border-[#d1d5db] rounded px-1 py-0.5 text-xs" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "product-detail" && (
        <>
          <Field label="Product Name">
            <TextInput value={block.props.name} onChange={(v) => update({ name: v })} />
          </Field>
          <Field label="Description">
            <TextInput value={block.props.description ?? ""} onChange={(v) => update({ description: v })} />
          </Field>
          <Field label="Price">
            <TextInput value={block.props.price} onChange={(v) => update({ price: v })} />
          </Field>
          <Field label="Badge (optional)">
            <TextInput value={block.props.badge ?? ""} onChange={(v) => update({ badge: v || undefined })} />
          </Field>
          <Field label="Image URL">
            <TextInput value={block.props.imageSrc ?? ""} onChange={(v) => update({ imageSrc: v })} />
          </Field>
          <Field label="Image Alt">
            <TextInput value={block.props.imageAlt ?? ""} onChange={(v) => update({ imageAlt: v })} />
          </Field>
          <Field label="Button Label">
            <TextInput value={block.props.ctaLabel ?? ""} onChange={(v) => update({ ctaLabel: v })} />
          </Field>
          <Field label="Button Link">
            <TextInput value={block.props.ctaHref ?? ""} onChange={(v) => update({ ctaHref: v })} />
          </Field>
          <Field label="Button Target">
            <Select value={block.props.ctaTarget ?? "_self"} onChange={(v) => update({ ctaTarget: v })} options={[{ label: "Same tab", value: "_self" }, { label: "New tab", value: "_blank" }]} />
          </Field>
          <Field label="Layout">
            <Select value={block.props.layout ?? "image-left"} onChange={(v) => update({ layout: v })} options={[{ label: "Image Left", value: "image-left" }, { label: "Image Right", value: "image-right" }, { label: "Image Top", value: "image-top" }]} />
          </Field>
          <Field label="Accent Color">
            <ColorInput value={block.props.accentColor ?? "#f59e0b"} onChange={(v) => update({ accentColor: v })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? "#ffffff"} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Padding Top (px)">
            <NumberInput value={block.props.paddingTop ?? 40} onChange={(v) => update({ paddingTop: v })} min={0} max={200} />
          </Field>
          <Field label="Padding Bottom (px)">
            <NumberInput value={block.props.paddingBottom ?? 40} onChange={(v) => update({ paddingBottom: v })} min={0} max={200} />
          </Field>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Features List</span>
              <button onClick={() => update({ features: [...(block.props.features ?? []), "New feature"] })} className="text-[10px] text-[#2563eb] hover:underline">+ Add</button>
            </div>
            <div className="space-y-1">
              {(block.props.features ?? []).map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  <input type="text" value={feat} onChange={(e) => update({ features: block.props.features.map((f: string, i: number) => i === idx ? e.target.value : f) })} className="flex-1 border border-[#d1d5db] rounded px-1 py-0.5 text-xs focus:outline-none" />
                  <button onClick={() => update({ features: block.props.features.filter((_: string, i: number) => i !== idx) })} className="text-[10px] text-[#ef4444]">×</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "cart-button" && (
        <>
          <Field label="Position">
            <Select value={block.props.position ?? "fixed-bottom-right"} onChange={(v) => update({ position: v })} options={[{ label: "Fixed Bottom Right", value: "fixed-bottom-right" }, { label: "Fixed Bottom Left", value: "fixed-bottom-left" }, { label: "Inline", value: "inline" }]} />
          </Field>
          <Field label="Label (optional)">
            <TextInput value={block.props.label ?? ""} onChange={(v) => update({ label: v || undefined })} />
          </Field>
          <Field label="Background Color">
            <ColorInput value={block.props.backgroundColor ?? "#2563eb"} onChange={(v) => update({ backgroundColor: v })} />
          </Field>
          <Field label="Icon Color">
            <ColorInput value={block.props.iconColor ?? "#ffffff"} onChange={(v) => update({ iconColor: v })} />
          </Field>
        </>
      )}
    </div>
  );

}

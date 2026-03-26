import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useThemeStore } from "../../stores/useThemeStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import type { Theme } from "../../types/theme";

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Source Sans 3",
  "Merriweather",
  "Playfair Display",
  "Lora",
];

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#374151]">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 border border-[#d1d5db] rounded-lg px-3 py-2 text-sm w-full hover:bg-[#f9fafb] transition-colors"
        >
          <span
            className="w-4 h-4 rounded border border-black/10 inline-block shrink-0"
            style={{ background: value }}
          />
          <span className="text-[#1e293b] font-mono text-xs">{value}</span>
        </button>
        {open && (
          <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-xl p-3 border border-[#e2e8f0]">
            <HexColorPicker color={value} onChange={onChange} />
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full text-xs text-[#64748b] hover:text-[#1e293b]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThemeEditorModal() {
  const storeTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const updateProjectTheme = useProjectStore((s) => s.updateTheme);
  const closeTheme = useEditorStore((s) => s.closeThemeEditor);

  const [draft, setDraft] = useState<Theme>({ ...storeTheme });

  function update<K extends keyof Theme>(key: K, value: Theme[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleApply() {
    setTheme(draft);
    updateProjectTheme(draft);
    closeTheme();
  }

  function handleReset() {
    setDraft({ ...storeTheme });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <h2 className="text-lg font-semibold text-[#1e293b]">Theme Editor</h2>
          <button
            onClick={closeTheme}
            className="text-[#94a3b8] hover:text-[#1e293b] text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-6">
          {/* Colors */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1e293b]">Colors</h3>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Primary" value={draft.primaryColor} onChange={(v) => update("primaryColor", v)} />
              <ColorField label="Secondary" value={draft.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
              <ColorField label="Accent" value={draft.accentColor} onChange={(v) => update("accentColor", v)} />
              <ColorField label="Background" value={draft.backgroundColor} onChange={(v) => update("backgroundColor", v)} />
              <ColorField label="Text" value={draft.textColor} onChange={(v) => update("textColor", v)} />
            </div>
          </section>

          {/* Typography */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1e293b]">Typography</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Heading Font</label>
              <select
                value={draft.headingFont}
                onChange={(e) => update("headingFont", e.target.value)}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              >
                {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Body Font</label>
              <select
                value={draft.bodyFont}
                onChange={(e) => update("bodyFont", e.target.value)}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              >
                {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">
                Base Font Size: {draft.baseFontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={22}
                step={1}
                value={draft.baseFontSize}
                onChange={(e) => update("baseFontSize", Number(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
            </div>
          </section>

          {/* Heading Sizes */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1e293b]">Heading Sizes (rem)</h3>
            {(["h1", "h2", "h3", "h4"] as const).map((h) => (
              <div key={h} className="flex items-center gap-3">
                <label className="text-xs font-medium text-[#374151] w-6 uppercase">{h}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.125}
                  value={draft.headingSizes[h]}
                  onChange={(e) =>
                    update("headingSizes", { ...draft.headingSizes, [h]: Number(e.target.value) })
                  }
                  className="flex-1 accent-[#2563eb]"
                />
                <span className="text-xs text-[#64748b] w-12 text-right">
                  {draft.headingSizes[h]}rem
                </span>
              </div>
            ))}
          </section>

          {/* Layout */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1e293b]">Layout</h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">
                Max Width: {draft.maxWidth}px
              </label>
              <input
                type="range"
                min={800}
                max={1600}
                step={50}
                value={draft.maxWidth}
                onChange={(e) => update("maxWidth", Number(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">
                Border Radius: {draft.borderRadius}px
              </label>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={draft.borderRadius}
                onChange={(e) => update("borderRadius", Number(e.target.value))}
                className="w-full accent-[#2563eb]"
              />
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 border border-[#d1d5db] text-[#374151] py-2.5 rounded-lg text-sm font-medium hover:bg-[#f9fafb] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
}

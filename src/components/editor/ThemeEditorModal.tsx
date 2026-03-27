import { useState, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { useThemeStore } from "../../stores/useThemeStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useEditorStore } from "../../stores/useEditorStore";
import type { Theme } from "../../types/theme";
import { isTelemetryEnabled, setTelemetryEnabled } from "../ErrorBoundary";

// ─── WCAG contrast helpers ────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ContrastBadge({ ratio }: { ratio: number | null }) {
  if (ratio === null) return null;
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
        aaa
          ? "bg-green-100 text-green-700"
          : aa
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {aaa ? "AAA" : aa ? "AA" : "Fail"} {ratio.toFixed(1)}:1
    </span>
  );
}

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
  const project = useProjectStore((s) => s.project);
  const updateProjectMeta = useProjectStore((s) => s.updateProjectMeta);
  const closeTheme = useEditorStore((s) => s.closeThemeEditor);

  const [draft, setDraft] = useState<Theme>({ ...storeTheme });
  const [lang, setLang] = useState(project?.lang ?? "en");
  const [siteUrl, setSiteUrl] = useState(project?.siteUrl ?? "");
  const [author, setAuthor] = useState(project?.author ?? "");
  const [tags, setTags] = useState((project?.tags ?? []).join(", "));
  const [telemetry, setTelemetry] = useState(isTelemetryEnabled);

  const contrastTextBg = useMemo(
    () => contrastRatio(draft.textColor, draft.backgroundColor),
    [draft.textColor, draft.backgroundColor]
  );
  const contrastPrimaryBg = useMemo(
    () => contrastRatio(draft.primaryColor, draft.backgroundColor),
    [draft.primaryColor, draft.backgroundColor]
  );

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

            {/* Contrast checker */}
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs font-medium text-[#374151]">Contrast (WCAG)</p>
              <div className="flex items-center justify-between text-xs text-[#374151]">
                <span>Text on Background</span>
                <ContrastBadge ratio={contrastTextBg} />
              </div>
              <div className="flex items-center justify-between text-xs text-[#374151]">
                <span>Primary on Background</span>
                <ContrastBadge ratio={contrastPrimaryBg} />
              </div>
              {contrastTextBg !== null && contrastTextBg < 4.5 && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  ⚠ Text contrast is below WCAG AA (4.5:1). Consider adjusting text or background color.
                </p>
              )}
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

          {/* Project Settings */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#1e293b]">Project Settings</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Language (lang attribute)</label>
              <input
                type="text"
                placeholder="en"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  updateProjectMeta({ lang: e.target.value });
                }}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Site URL (for sitemap)</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={siteUrl}
                onChange={(e) => {
                  setSiteUrl(e.target.value);
                  updateProjectMeta({ siteUrl: e.target.value });
                }}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Author</label>
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  updateProjectMeta({ author: e.target.value });
                }}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#374151]">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="blog, portfolio, landing"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  const parsed = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                  updateProjectMeta({ tags: parsed });
                }}
                className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
              />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <input
                id="telemetry-toggle"
                type="checkbox"
                checked={telemetry}
                onChange={(e) => {
                  setTelemetry(e.target.checked);
                  setTelemetryEnabled(e.target.checked);
                }}
                className="h-4 w-4 accent-[#2563eb]"
              />
              <label htmlFor="telemetry-toggle" className="text-xs text-[#374151] leading-snug">
                Send anonymous crash reports to help improve StackPage
              </label>
            </div>
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

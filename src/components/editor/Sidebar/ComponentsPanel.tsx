import { BLOCK_TYPES, type BlockType } from "../../../types/blocks";
import { nanoid } from "../../../types/nanoid";
import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import { createNewSection } from "../../../types/project";

const CATEGORIES = Array.from(new Set(BLOCK_TYPES.map((b) => b.category)));

function createDefaultBlock(type: BlockType) {
  const id = nanoid();
  const defaults: Record<BlockType, object> = {
    heading: { text: "Heading", level: 2, align: "left", fontWeight: "bold" },
    text: { text: "Add your text here. Click to edit.", align: "left" },
    button: { label: "Click here", href: "#", target: "_self", variant: "primary", align: "left", size: "md" },
    image: { src: "", alt: "Image", width: 100, align: "center", objectFit: "cover" },
    container: { paddingTop: 32, paddingBottom: 32, paddingLeft: 16, paddingRight: 16, children: [] },
    "two-column": { gap: 24, leftWidth: 50, leftChildren: [], rightChildren: [], stackOnMobile: true, paddingTop: 32, paddingBottom: 32 },
    "three-column": { gap: 24, col1Children: [], col2Children: [], col3Children: [], stackOnMobile: true, paddingTop: 32, paddingBottom: 32 },
    gallery: { images: [], columns: 3, gap: 16, showCaptions: false },
    "contact-form": {
      fields: [
        { id: nanoid(), label: "Name", type: "text", required: true },
        { id: nanoid(), label: "Email", type: "email", required: true },
        { id: nanoid(), label: "Message", type: "textarea", required: true },
      ],
      submitLabel: "Send Message",
      successMessage: "Thank you! We'll be in touch soon.",
      paddingTop: 48,
      paddingBottom: 48,
    },
    footer: {
      companyName: "Your Company",
      copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      links: [{ id: nanoid(), label: "Privacy", href: "#" }],
      backgroundColor: "#1e293b",
      textColor: "#94a3b8",
      align: "center",
      paddingTop: 32,
      paddingBottom: 32,
    },
    navigation: {
      logoText: "My Site",
      logoType: "text",
      links: [
        { id: nanoid(), label: "Home", href: "index.html" },
        { id: nanoid(), label: "About", href: "about.html" },
        { id: nanoid(), label: "Contact", href: "contact.html" },
      ],
      sticky: false,
      backgroundColor: "#ffffff",
      textColor: "#1e293b",
      showMobileMenu: true,
    },
  };
  return { id, type, props: defaults[type] };
}

export default function ComponentsPanel() {
  const activePageId = useEditorStore((s) => s.activePageId);
  const project = useProjectStore((s) => s.project);
  const addSection = useProjectStore((s) => s.addSection);
  const addBlock = useProjectStore((s) => s.addBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);

  function handleAddBlock(type: BlockType) {
    if (!activePageId || !project) return;
    const page = project.pages.find((p) => p.id === activePageId);
    if (!page) return;

    // Add to last section, or create a new section first
    let sectionId: string;
    if (page.sections.length === 0) {
      const section = createNewSection();
      addSection(activePageId, section);
      sectionId = section.id;
    } else {
      sectionId = page.sections[page.sections.length - 1].id;
    }

    const block = createDefaultBlock(type) as any;
    addBlock(activePageId, sectionId, block);
    selectBlock(block.id, sectionId);
  }

  return (
    <div className="p-3">
      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-4">
          <h4 className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
            {cat}
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {BLOCK_TYPES.filter((b) => b.category === cat).map((b) => (
              <button
                key={b.type}
                onClick={() => handleAddBlock(b.type)}
                draggable
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#eff6ff] transition-colors text-center cursor-pointer"
              >
                <span className="text-lg">{b.icon}</span>
                <span className="text-[10px] text-[#374151] font-medium leading-tight">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

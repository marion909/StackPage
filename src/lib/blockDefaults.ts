import { nanoid } from "../types/nanoid";
import type { Block, BlockType } from "../types/blocks";

export function createDefaultBlock(type: BlockType): Block {
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
  return { id, type, props: defaults[type] } as Block;
}

export type BlockType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "container"
  | "two-column"
  | "three-column"
  | "gallery"
  | "contact-form"
  | "footer"
  | "navigation";

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: "left" | "center" | "right";
  color?: string;
  fontSize?: number;
  fontWeight?: "normal" | "semibold" | "bold" | "extrabold";
}
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  props: HeadingBlockProps;
}

export interface TextBlockProps {
  text: string;
  align: "left" | "center" | "right";
  color?: string;
  fontSize?: number;
}
export interface TextBlock extends BaseBlock {
  type: "text";
  props: TextBlockProps;
}

export interface ButtonBlockProps {
  label: string;
  href: string;
  target: "_self" | "_blank";
  variant: "primary" | "secondary" | "outline";
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg";
}
export interface ButtonBlock extends BaseBlock {
  type: "button";
  props: ButtonBlockProps;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  width: number; // percentage 0-100
  align: "left" | "center" | "right";
  objectFit: "cover" | "contain" | "fill";
  borderRadius?: number;
  caption?: string;
}
export interface ImageBlock extends BaseBlock {
  type: "image";
  props: ImageBlockProps;
}

export interface ContainerBlockProps {
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  maxWidth?: number;
  children: Block[];
}
export interface ContainerBlock extends BaseBlock {
  type: "container";
  props: ContainerBlockProps;
}

export interface TwoColumnProps {
  gap: number;
  leftWidth: number; // percentage (e.g. 50)
  leftChildren: Block[];
  rightChildren: Block[];
  stackOnMobile: boolean;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface TwoColumnBlock extends BaseBlock {
  type: "two-column";
  props: TwoColumnProps;
}

export interface ThreeColumnProps {
  gap: number;
  col1Children: Block[];
  col2Children: Block[];
  col3Children: Block[];
  stackOnMobile: boolean;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface ThreeColumnBlock extends BaseBlock {
  type: "three-column";
  props: ThreeColumnProps;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}
export interface GalleryBlockProps {
  images: GalleryImage[];
  columns: 2 | 3 | 4;
  gap: number;
  showCaptions: boolean;
  borderRadius?: number;
}
export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  props: GalleryBlockProps;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  required: boolean;
}
export interface ContactFormProps {
  fields: FormField[];
  submitLabel: string;
  successMessage: string;
  recipientEmail?: string;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface ContactFormBlock extends BaseBlock {
  type: "contact-form";
  props: ContactFormProps;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}
export interface FooterBlockProps {
  companyName: string;
  copyrightText: string;
  links: FooterLink[];
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  paddingTop: number;
  paddingBottom: number;
}
export interface FooterBlock extends BaseBlock {
  type: "footer";
  props: FooterBlockProps;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}
export interface NavigationProps {
  logoText: string;
  logoImageSrc?: string;
  logoType: "text" | "image";
  links: NavLink[];
  sticky: boolean;
  backgroundColor: string;
  textColor: string;
  showMobileMenu: boolean;
}
export interface NavigationBlock extends BaseBlock {
  type: "navigation";
  props: NavigationProps;
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | ContainerBlock
  | TwoColumnBlock
  | ThreeColumnBlock
  | GalleryBlock
  | ContactFormBlock
  | FooterBlock
  | NavigationBlock;

// Block type display metadata
export const BLOCK_TYPES: { type: BlockType; label: string; icon: string; category: string }[] = [
  { type: "navigation", label: "Navigation", icon: "☰", category: "Layout" },
  { type: "heading", label: "Heading", icon: "H", category: "Text" },
  { type: "text", label: "Text", icon: "¶", category: "Text" },
  { type: "button", label: "Button", icon: "⏎", category: "Interactive" },
  { type: "image", label: "Image", icon: "🖼", category: "Media" },
  { type: "gallery", label: "Gallery", icon: "⊞", category: "Media" },
  { type: "container", label: "Container", icon: "□", category: "Layout" },
  { type: "two-column", label: "2 Columns", icon: "⊟", category: "Layout" },
  { type: "three-column", label: "3 Columns", icon: "⊞", category: "Layout" },
  { type: "contact-form", label: "Contact Form", icon: "✉", category: "Interactive" },
  { type: "footer", label: "Footer", icon: "▬", category: "Layout" },
];

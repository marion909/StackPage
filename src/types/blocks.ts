export type BlockType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "container"
  | "two-column"
  | "three-column"
  | "four-column"
  | "asymmetric-column"
  | "vertical-stack"
  | "masonry-grid"
  | "gallery"
  | "contact-form"
  | "footer"
  | "navigation"
  | "slide-banner"
  | "divider"
  | "video"
  | "hero"
  | "testimonial"
  | "pricing-table"
  | "icon"
  | "map"
  | "product-card"
  | "product-grid"
  | "product-detail"
  | "cart-button"
  | "faq"
  | "embed"
  | "social-share"
  | "cookie-banner"
  | "countdown"
  | "timeline";

interface BaseBlock {
  id: string;
  type: BlockType;
  /** Optional per-block corner radius in px. Falls back to theme.borderRadius if not set. */
  cornerRadius?: number;
  /** Editor-only notes / comments for this block. Not exported to HTML. */
  notes?: string;
  /** Custom CSS injected into the exported page for this block (scoped via data-block-id). */
  customCss?: string;
  /** Scroll animation preset for this block in the exported site. */
  animation?: "none" | "fade-in" | "slide-up" | "slide-left" | "slide-right" | "zoom-in";
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
  type: "text" | "email" | "tel" | "textarea" | "date" | "time" | "datetime-local" | "number" | "url" | "select";
  placeholder?: string;
  required: boolean;
  /** Comma-separated options for select fields */
  selectOptions?: string;
}
export type ContactFormSubmitMode = "formspree" | "netlify" | "mailto";
export interface ContactFormProps {
  fields: FormField[];
  submitLabel: string;
  successMessage: string;
  submitMode: ContactFormSubmitMode;
  /** Formspree: full endpoint URL like https://formspree.io/f/xxxxx */
  formspreeEndpoint?: string;
  /** Netlify: name attribute for the form (used by Netlify's form detection) */
  netlifyFormName?: string;
  /** mailto fallback: recipient address */
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

export interface SlideItem {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  overlayColor?: string; // rgba
  titleColor?: string;
  subtitleColor?: string;
}
export interface SlideBannerProps {
  slides: SlideItem[];
  height: number; // px
  autoplay: boolean;
  autoplayInterval: number; // ms
  showArrows: boolean;
  showIndicators: boolean;
  objectFit: "cover" | "contain" | "fill";
  borderRadius?: number;
}
export interface SlideBannerBlock extends BaseBlock {
  type: "slide-banner";
  props: SlideBannerProps;
}

// ─── Divider / Spacer ─────────────────────────────────────────────────────
export interface DividerBlockProps {
  variant: "rule" | "spacer";
  height: number;         // spacer height (px) or rule thickness (px)
  color: string;          // rule color
  lineStyle: "solid" | "dashed" | "dotted";
  width: number;          // percentage of container
  marginTop: number;
  marginBottom: number;
}
export interface DividerBlock extends BaseBlock {
  type: "divider";
  props: DividerBlockProps;
}

// ─── Video ────────────────────────────────────────────────────────────────
export interface VideoBlockProps {
  url: string;
  videoType: "youtube" | "vimeo" | "direct";
  aspectRatio: "16/9" | "4/3" | "1/1";
  controls: boolean;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  borderRadius?: number;
  align: "left" | "center" | "right";
  width: number; // percentage
}
export interface VideoBlock extends BaseBlock {
  type: "video";
  props: VideoBlockProps;
}

// ─── Hero ─────────────────────────────────────────────────────────────────
export interface HeroBlockProps {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: "primary" | "secondary" | "outline";
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  backgroundImage: string;
  backgroundColor: string;
  overlayColor: string;
  headingColor: string;
  subheadingColor: string;
  textAlign: "left" | "center" | "right";
  paddingTop: number;
  paddingBottom: number;
  minHeight: number;
}
export interface HeroBlock extends BaseBlock {
  type: "hero";
  props: HeroBlockProps;
}

// ─── Testimonial ──────────────────────────────────────────────────────────
export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  rating: number; // 0 = hidden, 1-5
}
export interface TestimonialBlockProps {
  items: TestimonialItem[];
  columns: 1 | 2 | 3;
  backgroundColor?: string;
  cardColor: string;
  quoteColor: string;
  authorColor: string;
  showRating: boolean;
  paddingTop: number;
  paddingBottom: number;
}
export interface TestimonialBlock extends BaseBlock {
  type: "testimonial";
  props: TestimonialBlockProps;
}

// ─── Pricing Table ────────────────────────────────────────────────────────
export interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
}
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
  highlightColor: string;
}
export interface PricingTableProps {
  plans: PricingPlan[];
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface PricingTableBlock extends BaseBlock {
  type: "pricing-table";
  props: PricingTableProps;
}

// ─── Icon ─────────────────────────────────────────────────────────────────
export interface IconBlockProps {
  iconName: string;
  size: number; // px
  color: string;
  align: "left" | "center" | "right";
  label: string;
  labelColor: string;
  href: string;
}
export interface IconBlock extends BaseBlock {
  type: "icon";
  props: IconBlockProps;
}

// ─── Map ──────────────────────────────────────────────────────────────────
export interface MapBlockProps {
  embedUrl: string;
  height: number;
  borderRadius?: number;
  align: "left" | "center" | "right";
  width: number; // percentage
}
export interface MapBlock extends BaseBlock {
  type: "map";
  props: MapBlockProps;
}

// ─── Four Column ──────────────────────────────────────────────────────────
export interface FourColumnProps {
  gap: number;
  col1Children: Block[];
  col2Children: Block[];
  col3Children: Block[];
  col4Children: Block[];
  stackOnMobile: boolean;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface FourColumnBlock extends BaseBlock {
  type: "four-column";
  props: FourColumnProps;
}

// ─── Asymmetric Column ────────────────────────────────────────────────────
export interface AsymmetricColumnProps {
  gap: number;
  leftWidth: number; // percentage (e.g. 33)
  leftChildren: Block[];
  rightChildren: Block[];
  stackOnMobile: boolean;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  leftVerticalAlign: "top" | "center" | "bottom";
  rightVerticalAlign: "top" | "center" | "bottom";
}
export interface AsymmetricColumnBlock extends BaseBlock {
  type: "asymmetric-column";
  props: AsymmetricColumnProps;
}

// ─── Vertical Stack ───────────────────────────────────────────────────────
export interface VerticalStackProps {
  gap: number;
  align: "start" | "center" | "end" | "stretch";
  showDivider: boolean;
  dividerColor: string;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  children: Block[];
}
export interface VerticalStackBlock extends BaseBlock {
  type: "vertical-stack";
  props: VerticalStackProps;
}

// ─── Masonry Grid ─────────────────────────────────────────────────────────
export interface MasonryGridProps {
  columns: 2 | 3 | 4 | 5;
  gap: number;
  backgroundColor?: string;
  paddingTop: number;
  paddingBottom: number;
  items: Block[][];
}
export interface MasonryGridBlock extends BaseBlock {
  type: "masonry-grid";
  props: MasonryGridProps;
}

// ─── Product Card ─────────────────────────────────────────────────────────
export interface ProductCardItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaTarget: "_self" | "_blank";
}
export interface ProductCardProps extends ProductCardItem {
  paddingTop: number;
  paddingBottom: number;
  borderRadius: number;
  shadow: boolean;
  outlined: boolean;
  backgroundColor: string;
}
export interface ProductCardBlock extends BaseBlock {
  type: "product-card";
  props: ProductCardProps;
}

// ─── Product Grid ─────────────────────────────────────────────────────────
export interface ProductGridProps {
  items: ProductCardItem[];
  columns: 2 | 3 | 4;
  gap: number;
  paddingTop: number;
  paddingBottom: number;
  cardStyle: "flat" | "outlined" | "shadowed";
  borderRadius: number;
  backgroundColor?: string;
}
export interface ProductGridBlock extends BaseBlock {
  type: "product-grid";
  props: ProductGridProps;
}

// ─── Product Detail ───────────────────────────────────────────────────────
export interface ProductDetailProps extends ProductCardItem {
  features: string[];
  layout: "image-left" | "image-right" | "image-top";
  galleryImages: string[];
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  accentColor: string;
}
export interface ProductDetailBlock extends BaseBlock {
  type: "product-detail";
  props: ProductDetailProps;
}

// ─── Cart Button ──────────────────────────────────────────────────────────
export interface CartButtonProps {
  position: "fixed-bottom-right" | "fixed-bottom-left" | "inline";
  backgroundColor: string;
  iconColor: string;
  label: string;
}
export interface CartButtonBlock extends BaseBlock {
  type: "cart-button";
  props: CartButtonProps;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  open?: boolean;
}
export interface FaqProps {
  items: FaqItem[];
  headingText?: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  paddingTop: number;
  paddingBottom: number;
}
export interface FaqBlock extends BaseBlock {
  type: "faq";
  props: FaqProps;
}

// ─── Embed ────────────────────────────────────────────────────────────────
export interface EmbedProps {
  url: string;
  height: number;
  title: string;
  allowFullscreen: boolean;
  align: "left" | "center" | "right";
}
export interface EmbedBlock extends BaseBlock {
  type: "embed";
  props: EmbedProps;
}

// ─── Social Share ─────────────────────────────────────────────────────────
export interface SocialShareProps {
  url?: string; // If empty, use current page URL
  title?: string;
  platforms: ("twitter" | "facebook" | "linkedin" | "whatsapp")[];
  align: "left" | "center" | "right";
  buttonStyle: "icon" | "label" | "both";
  iconColor: string;
  backgroundColor: string;
}
export interface SocialShareBlock extends BaseBlock {
  type: "social-share";
  props: SocialShareProps;
}

// ─── Cookie Banner ────────────────────────────────────────────────────────
export interface CookieBannerProps {
  message: string;
  acceptLabel: string;
  declineLabel: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  storageKey: string;
}
export interface CookieBannerBlock extends BaseBlock {
  type: "cookie-banner";
  props: CookieBannerProps;
}

// ─── Countdown ────────────────────────────────────────────────────────────
export interface CountdownProps {
  targetDate: string; // ISO date string
  heading?: string;
  expiredText: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  align: "left" | "center" | "right";
  paddingTop: number;
  paddingBottom: number;
}
export interface CountdownBlock extends BaseBlock {
  type: "countdown";
  props: CountdownProps;
}

// ─── Timeline ─────────────────────────────────────────────────────────────
export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  content: string;
  icon?: string;
}
export interface TimelineProps {
  items: TimelineItem[];
  accentColor: string;
  dateColor: string;
  textColor: string;
  lineColor: string;
  align: "left" | "center";
  paddingTop: number;
  paddingBottom: number;
}
export interface TimelineBlock extends BaseBlock {
  type: "timeline";
  props: TimelineProps;
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | ContainerBlock
  | TwoColumnBlock
  | ThreeColumnBlock
  | FourColumnBlock
  | AsymmetricColumnBlock
  | VerticalStackBlock
  | MasonryGridBlock
  | GalleryBlock
  | ContactFormBlock
  | FooterBlock
  | NavigationBlock
  | SlideBannerBlock
  | DividerBlock
  | VideoBlock
  | HeroBlock
  | TestimonialBlock
  | PricingTableBlock
  | IconBlock
  | MapBlock
  | ProductCardBlock
  | ProductGridBlock
  | ProductDetailBlock
  | CartButtonBlock
  | FaqBlock
  | EmbedBlock
  | SocialShareBlock
  | CookieBannerBlock
  | CountdownBlock
  | TimelineBlock;

// Block type display metadata
export const BLOCK_TYPES: { type: BlockType; label: string; icon: string; category: string }[] = [
  { type: "navigation", label: "Navigation", icon: "☰", category: "Layout" },
  { type: "heading", label: "Heading", icon: "H", category: "Text" },
  { type: "text", label: "Text", icon: "¶", category: "Text" },
  { type: "button", label: "Button", icon: "⏎", category: "Interactive" },
  { type: "image", label: "Image", icon: "🖼", category: "Media" },
  { type: "gallery", label: "Gallery", icon: "⊞", category: "Media" },
  { type: "slide-banner", label: "Slide Banner", icon: "▷", category: "Media" },
  { type: "video", label: "Video", icon: "▶", category: "Media" },
  { type: "hero", label: "Hero", icon: "★", category: "Sections" },
  { type: "testimonial", label: "Testimonial", icon: "❝", category: "Sections" },
  { type: "pricing-table", label: "Pricing Table", icon: "₿", category: "Sections" },
  { type: "icon", label: "Icon", icon: "◉", category: "Media" },
  { type: "map", label: "Map", icon: "⊕", category: "Media" },
  { type: "divider", label: "Divider", icon: "—", category: "Layout" },
  { type: "container", label: "Container", icon: "□", category: "Layout" },
  { type: "two-column", label: "2 Columns", icon: "⊟", category: "Layout" },
  { type: "three-column", label: "3 Columns", icon: "⊞", category: "Layout" },
  { type: "four-column", label: "4 Columns", icon: "⦶", category: "Layout" },
  { type: "asymmetric-column", label: "Asymmetric", icon: "⊡", category: "Layout" },
  { type: "vertical-stack", label: "Vertical Stack", icon: "≡", category: "Layout" },
  { type: "masonry-grid", label: "Masonry Grid", icon: "⊹", category: "Layout" },
  { type: "contact-form", label: "Contact Form", icon: "✉", category: "Interactive" },
  { type: "footer", label: "Footer", icon: "▬", category: "Layout" },
  { type: "product-card", label: "Product Card", icon: "🛍", category: "Shop" },
  { type: "product-grid", label: "Product Grid", icon: "🗂", category: "Shop" },
  { type: "product-detail", label: "Product Detail", icon: "📦", category: "Shop" },
  { type: "cart-button", label: "Cart Button", icon: "🛒", category: "Shop" },
  { type: "faq", label: "FAQ", icon: "❓", category: "Sections" },
  { type: "embed", label: "Embed", icon: "⊕", category: "Media" },
  { type: "social-share", label: "Social Share", icon: "↗", category: "Interactive" },
  { type: "cookie-banner", label: "Cookie Banner", icon: "🍪", category: "Interactive" },
  { type: "countdown", label: "Countdown", icon: "⏱", category: "Sections" },
  { type: "timeline", label: "Timeline", icon: "📅", category: "Sections" },
];

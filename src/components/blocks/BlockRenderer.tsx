import type { Block } from "../../types/blocks";
import HeadingBlock from "./HeadingBlock";
import TextBlock from "./TextBlock";
import ButtonBlock from "./ButtonBlock";
import ImageBlock from "./ImageBlock";
import ContainerBlock from "./ContainerBlock";
import TwoColumnBlock from "./TwoColumnBlock";
import ThreeColumnBlock from "./ThreeColumnBlock";
import FourColumnBlock from "./FourColumnBlock";
import AsymmetricColumnBlock from "./AsymmetricColumnBlock";
import VerticalStackBlock from "./VerticalStackBlock";
import MasonryGridBlock from "./MasonryGridBlock";
import GalleryBlock from "./GalleryBlock";
import ContactFormBlock from "./ContactFormBlock";
import FooterBlock from "./FooterBlock";
import NavigationBlock from "./NavigationBlock";
import SlideBannerBlock from "./SlideBannerBlock";
import DividerBlock from "./DividerBlock";
import VideoBlock from "./VideoBlock";
import HeroBlock from "./HeroBlock";
import TestimonialBlock from "./TestimonialBlock";
import PricingTableBlock from "./PricingTableBlock";
import IconBlock from "./IconBlock";
import MapBlock from "./MapBlock";
import ProductCardBlock from "./ProductCardBlock";
import ProductGridBlock from "./ProductGridBlock";
import ProductDetailBlock from "./ProductDetailBlock";
import CartButtonBlock from "./CartButtonBlock";
import FaqBlock from "./FaqBlock";
import EmbedBlock from "./EmbedBlock";
import SocialShareBlock from "./SocialShareBlock";
import CookieBannerBlock from "./CookieBannerBlock";
import CountdownBlock from "./CountdownBlock";
import TimelineBlock from "./TimelineBlock";

interface Props {
  block: Block;
  onPropChange?: (props: Partial<Block["props"]>) => void;
  isEditing?: boolean;
}

export default function BlockRenderer({ block, onPropChange, isEditing }: Props) {
  const change = onPropChange ?? (() => {});

  switch (block.type) {
    case "heading":
      return <HeadingBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "text":
      return <TextBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "button":
      return <ButtonBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "image":
      return <ImageBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "container":
      return <ContainerBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "two-column":
      return <TwoColumnBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "three-column":
      return <ThreeColumnBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "four-column":
      return <FourColumnBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "asymmetric-column":
      return <AsymmetricColumnBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "vertical-stack":
      return <VerticalStackBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "masonry-grid":
      return <MasonryGridBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "gallery":
      return <GalleryBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "contact-form":
      return <ContactFormBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "footer":
      return <FooterBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "navigation":
      return <NavigationBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "slide-banner":
      return <SlideBannerBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "divider":
      return <DividerBlock block={block} isEditing={!!isEditing} />;
    case "video":
      return <VideoBlock block={block} isEditing={!!isEditing} />;
    case "hero":
      return <HeroBlock block={block} isEditing={!!isEditing} />;
    case "testimonial":
      return <TestimonialBlock block={block} isEditing={!!isEditing} />;
    case "pricing-table":
      return <PricingTableBlock block={block} isEditing={!!isEditing} />;
    case "icon":
      return <IconBlock block={block} isEditing={!!isEditing} />;
    case "map":
      return <MapBlock block={block} isEditing={!!isEditing} />;
    case "product-card":
      return <ProductCardBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "product-grid":
      return <ProductGridBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "product-detail":
      return <ProductDetailBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "cart-button":
      return <CartButtonBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "faq":
      return <FaqBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "embed":
      return <EmbedBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "social-share":
      return <SocialShareBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "cookie-banner":
      return <CookieBannerBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "countdown":
      return <CountdownBlock block={block} onChange={change} isEditing={!!isEditing} />;
    case "timeline":
      return <TimelineBlock block={block} onChange={change} isEditing={!!isEditing} />;
    default:
      return null;
  }
}


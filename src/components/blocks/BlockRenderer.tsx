import type { Block } from "../../types/blocks";
import HeadingBlock from "./HeadingBlock";
import TextBlock from "./TextBlock";
import ButtonBlock from "./ButtonBlock";
import ImageBlock from "./ImageBlock";
import ContainerBlock from "./ContainerBlock";
import TwoColumnBlock from "./TwoColumnBlock";
import ThreeColumnBlock from "./ThreeColumnBlock";
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
    default:
      return null;
  }
}


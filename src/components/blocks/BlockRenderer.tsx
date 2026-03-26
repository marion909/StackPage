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
    default:
      return null;
  }
}

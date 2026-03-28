import type { Section } from "../types/project";
import { createNewSection } from "../types/project";
import { createDefaultBlock } from "./blockDefaults";

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  buildSections: () => Section[];
}

function section(blocks: ReturnType<typeof createDefaultBlock>[], overrides?: Partial<Section>): Section {
  const s = createNewSection();
  s.blocks = blocks as Section["blocks"];
  return { ...s, ...overrides };
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty canvas",
    emoji: "⬜",
    buildSections: () => [],
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero, features, testimonials, CTA and footer",
    emoji: "🚀",
    buildSections: () => {
      const hero = createDefaultBlock("hero");
      if (hero.type === "hero") {
        hero.props.heading = "Welcome to Our Product";
        hero.props.subheading = "The easiest way to build beautiful websites without code.";
        hero.props.ctaLabel = "Get Started Free";
        hero.props.ctaHref = "#";
        hero.props.ctaSecondaryLabel = "Learn More";
        hero.props.ctaSecondaryHref = "#";
      }

      const featHeading = createDefaultBlock("heading");
      if (featHeading.type === "heading") {
        featHeading.props.text = "Why Choose Us?";
        featHeading.props.align = "center";
        featHeading.props.level = 2;
      }

      const threeCol = createDefaultBlock("three-column");
      if (threeCol.type === "three-column") {
        const icon1 = createDefaultBlock("icon");
        if (icon1.type === "icon") { icon1.props.iconName = "bolt"; icon1.props.align = "center"; }
        const h1 = createDefaultBlock("heading");
        if (h1.type === "heading") { h1.props.text = "Fast"; h1.props.align = "center"; h1.props.level = 3; }
        const t1 = createDefaultBlock("text");
        if (t1.type === "text") { t1.props.text = "Blazing fast performance right out of the box."; t1.props.align = "center"; }

        const icon2 = createDefaultBlock("icon");
        if (icon2.type === "icon") { icon2.props.iconName = "shield"; icon2.props.align = "center"; }
        const h2 = createDefaultBlock("heading");
        if (h2.type === "heading") { h2.props.text = "Secure"; h2.props.align = "center"; h2.props.level = 3; }
        const t2 = createDefaultBlock("text");
        if (t2.type === "text") { t2.props.text = "Enterprise-grade security built in from day one."; t2.props.align = "center"; }

        const icon3 = createDefaultBlock("icon");
        if (icon3.type === "icon") { icon3.props.iconName = "check-circle"; icon3.props.align = "center"; }
        const h3 = createDefaultBlock("heading");
        if (h3.type === "heading") { h3.props.text = "Easy"; h3.props.align = "center"; h3.props.level = 3; }
        const t3 = createDefaultBlock("text");
        if (t3.type === "text") { t3.props.text = "Simple drag-and-drop interface anyone can use."; t3.props.align = "center"; }

        threeCol.props.col1Children = [icon1 as never, h1 as never, t1 as never];
        threeCol.props.col2Children = [icon2 as never, h2 as never, t2 as never];
        threeCol.props.col3Children = [icon3 as never, h3 as never, t3 as never];
      }

      const testimonials = createDefaultBlock("testimonial");

      const ctaHeading = createDefaultBlock("heading");
      if (ctaHeading.type === "heading") {
        ctaHeading.props.text = "Ready to get started?";
        ctaHeading.props.align = "center";
        ctaHeading.props.level = 2;
      }
      const ctaBtn = createDefaultBlock("button");
      if (ctaBtn.type === "button") {
        ctaBtn.props.label = "Start Free Trial";
        ctaBtn.props.align = "center";
        ctaBtn.props.href = "#";
        ctaBtn.props.size = "lg";
      }

      const nav = createDefaultBlock("navigation");
      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([hero as never], { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
        section([featHeading as never, threeCol as never], { paddingTop: 80, paddingBottom: 80 }),
        section([testimonials as never], { paddingTop: 80, paddingBottom: 80, backgroundColor: "#f8fafc" }),
        section([ctaHeading as never, ctaBtn as never], { paddingTop: 80, paddingBottom: 80 }),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },
  {
    id: "about",
    name: "About",
    description: "Company intro, team section, and contact form",
    emoji: "👋",
    buildSections: () => {
      const nav = createDefaultBlock("navigation");

      const hero = createDefaultBlock("hero");
      if (hero.type === "hero") {
        hero.props.heading = "About Us";
        hero.props.subheading = "We're a passionate team building tools that make the web more accessible.";
        hero.props.ctaLabel = "";
        hero.props.ctaSecondaryLabel = "";
        hero.props.minHeight = 300;
      }

      const storyHeading = createDefaultBlock("heading");
      if (storyHeading.type === "heading") { storyHeading.props.text = "Our Story"; storyHeading.props.level = 2; }
      const storyText = createDefaultBlock("text");
      if (storyText.type === "text") {
        storyText.props.text = "Founded in 2024, we set out to make website creation accessible to everyone — no code required. Our team of designers and engineers has built a platform that puts creativity first.";
      }

      const teamHeading = createDefaultBlock("heading");
      if (teamHeading.type === "heading") { teamHeading.props.text = "Meet the Team"; teamHeading.props.align = "center"; teamHeading.props.level = 2; }

      const contactHeading = createDefaultBlock("heading");
      if (contactHeading.type === "heading") { contactHeading.props.text = "Get in Touch"; contactHeading.props.align = "center"; contactHeading.props.level = 2; }
      const contactForm = createDefaultBlock("contact-form");

      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([hero as never], { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
        section([storyHeading as never, storyText as never], { paddingTop: 64, paddingBottom: 64 }),
        section([teamHeading as never], { paddingTop: 64, paddingBottom: 32, backgroundColor: "#f8fafc" }),
        section([contactHeading as never, contactForm as never], { paddingTop: 64, paddingBottom: 64 }),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },
  {
    id: "contact",
    name: "Contact",
    description: "Simple contact page with form and map",
    emoji: "📬",
    buildSections: () => {
      const nav = createDefaultBlock("navigation");

      const heading = createDefaultBlock("heading");
      if (heading.type === "heading") { heading.props.text = "Contact Us"; heading.props.align = "center"; heading.props.level = 1; }

      const sub = createDefaultBlock("text");
      if (sub.type === "text") { sub.props.text = "We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible."; sub.props.align = "center"; }

      const form = createDefaultBlock("contact-form");
      const map = createDefaultBlock("map");
      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([heading as never, sub as never, form as never], { paddingTop: 64, paddingBottom: 64 }),
        section([map as never], { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, fullWidth: true }),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase your work with a gallery and image grid",
    emoji: "🎨",
    buildSections: () => {
      const nav = createDefaultBlock("navigation");

      const hero = createDefaultBlock("hero");
      if (hero.type === "hero") {
        hero.props.heading = "My Portfolio";
        hero.props.subheading = "A collection of projects I've designed and built.";
        hero.props.ctaLabel = "View Work";
        hero.props.ctaHref = "#work";
        hero.props.ctaSecondaryLabel = "";
        hero.props.minHeight = 400;
      }

      const workHeading = createDefaultBlock("heading");
      if (workHeading.type === "heading") { workHeading.props.text = "Selected Work"; workHeading.props.align = "center"; workHeading.props.level = 2; }

      const gallery = createDefaultBlock("gallery");

      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([hero as never], { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
        section([workHeading as never, gallery as never], { paddingTop: 64, paddingBottom: 64 }),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },

  {
    id: "product-landing",
    name: "Product Landing",
    description: "Hero, product detail, product grid, and footer",
    emoji: "🛍️",
    buildSections: () => {
      const nav = createDefaultBlock("navigation");

      const hero = createDefaultBlock("hero");
      if (hero.type === "hero") {
        hero.props.heading = "Discover Our Collection";
        hero.props.subheading = "Premium products crafted for modern living.";
        hero.props.ctaLabel = "Shop Now";
        hero.props.ctaHref = "#products";
        hero.props.ctaSecondaryLabel = "Learn More";
        hero.props.ctaSecondaryHref = "#detail";
        hero.props.minHeight = 500;
      }

      const detailHeading = createDefaultBlock("heading");
      if (detailHeading.type === "heading") {
        detailHeading.props.text = "Featured Product";
        detailHeading.props.align = "center";
        detailHeading.props.level = 2;
      }

      const detail = createDefaultBlock("product-detail");

      const gridHeading = createDefaultBlock("heading");
      if (gridHeading.type === "heading") {
        gridHeading.props.text = "More Products";
        gridHeading.props.align = "center";
        gridHeading.props.level = 2;
      }

      const grid = createDefaultBlock("product-grid");

      const cartBtn = createDefaultBlock("cart-button");

      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([hero as never], { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
        section([detailHeading as never, detail as never], { paddingTop: 64, paddingBottom: 64 }),
        section([gridHeading as never, grid as never], { paddingTop: 48, paddingBottom: 64 }),
        section([cartBtn as never]),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },

  {
    id: "shop-showcase",
    name: "Shop Showcase",
    description: "Navigation, full product grid showcase, and footer",
    emoji: "🏪",
    buildSections: () => {
      const nav = createDefaultBlock("navigation");

      const heading = createDefaultBlock("heading");
      if (heading.type === "heading") {
        heading.props.text = "Our Shop";
        heading.props.align = "center";
        heading.props.level = 1;
      }

      const subtext = createDefaultBlock("text");
      if (subtext.type === "text") {
        subtext.props.text = "Browse our full collection of premium products.";
        subtext.props.align = "center";
      }

      const grid = createDefaultBlock("product-grid");
      if (grid.type === "product-grid") {
        grid.props.columns = 3;
      }

      const cartBtn = createDefaultBlock("cart-button");

      const footer = createDefaultBlock("footer");

      return [
        section([nav as never]),
        section([heading as never, subtext as never], { paddingTop: 64, paddingBottom: 32 }),
        section([grid as never], { paddingTop: 24, paddingBottom: 80 }),
        section([cartBtn as never]),
        section([footer as never], { paddingTop: 0, paddingBottom: 0 }),
      ];
    },
  },
];

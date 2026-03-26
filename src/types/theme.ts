export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  baseFontSize: number; // px
  headingSizes: { h1: number; h2: number; h3: number; h4: number }; // rem
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number }; // px
  borderRadius: number; // px
  maxWidth: number; // px container width
}

export const DEFAULT_THEME: Theme = {
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#1e293b",
  headingFont: "Inter",
  bodyFont: "Inter",
  baseFontSize: 16,
  headingSizes: { h1: 3, h2: 2.25, h3: 1.75, h4: 1.375 },
  spacing: { xs: 8, sm: 16, md: 32, lg: 64, xl: 96 },
  borderRadius: 8,
  maxWidth: 1200,
};

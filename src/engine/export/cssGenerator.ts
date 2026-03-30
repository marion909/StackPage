import type { Theme } from "../../types/theme";

export function generateCSS(theme: Theme): string {
  return `/* StackPage – Generated Stylesheet */
@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(theme.bodyFont)}:wght@400;600&display=swap');

:root {
  --color-primary: ${theme.primaryColor};
  --color-secondary: ${theme.secondaryColor};
  --color-accent: ${theme.accentColor};
  --color-bg: ${theme.backgroundColor};
  --color-text: ${theme.textColor};
  --font-heading: '${theme.headingFont}', system-ui, sans-serif;
  --font-body: '${theme.bodyFont}', system-ui, sans-serif;
  --font-size-base: ${theme.baseFontSize}px;
  --radius: ${theme.borderRadius}px;
  --max-width: ${theme.maxWidth}px;
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  margin: 0;
}

h1 { font-size: ${theme.headingSizes.h1}rem; }
h2 { font-size: ${theme.headingSizes.h2}rem; }
h3 { font-size: ${theme.headingSizes.h3}rem; }
h4 { font-size: ${theme.headingSizes.h4}rem; }

p { margin: 0; line-height: 1.7; }

a { color: var(--color-primary); }

img { max-width: 100%; height: auto; }

/* Utility */
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 1rem; }

/* Mobile nav toggle */
@media (max-width: 768px) {
  .sp-nav-links { display: none; }
  .sp-nav-links.open { display: flex; flex-direction: column; }
  .sp-nav-hamburger { display: flex; }
}

/* Mobile nav toggle */
@media (max-width: 768px) {
  .sp-nav-links { display: none; }
  .sp-nav-links.open { display: flex; flex-direction: column; }
  .sp-nav-hamburger { display: flex; }
}

@media (min-width: 769px) {
  .sp-nav-hamburger { display: none; }
}

/* Dark mode support (toggled via [data-theme="dark"] on <html>) */
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #e2e8f0;
}

[data-theme="dark"] body {
  background: var(--color-bg);
  color: var(--color-text);
}

/* Scroll animations */
[data-anim] { opacity: 0; transition: opacity 0.6s ease, transform 0.6s ease; }
[data-anim='fade-in'] { transform: none; }
[data-anim='slide-up'] { transform: translateY(40px); }
[data-anim='slide-left'] { transform: translateX(-40px); }
[data-anim='slide-right'] { transform: translateX(40px); }
[data-anim='zoom-in'] { transform: scale(0.88); }
[data-anim].sp-anim-active { opacity: 1 !important; transform: none !important; }

/* Dark mode toggle button */
.sp-dark-toggle {
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 50px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.sp-dark-toggle:hover { opacity: 1; }
`;
}

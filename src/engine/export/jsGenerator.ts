/**
 * Generates minimal JavaScript for exported StackPage sites.
 * Handles: mobile nav toggle, smooth scroll, and basic form feedback.
 */
export function generateJS(): string {
  return `/* StackPage – Generated Script */
(function () {
  "use strict";

  /* ── Mobile navigation toggle ── */
  document.querySelectorAll("[data-hamburger]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nav = document.querySelector("[data-nav-links]");
      if (nav) {
        nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
      }
    });
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── Contact form submission feedback ── */
  document.querySelectorAll("form[data-sp-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      /* mailto forms are handled by the browser natively */
      if (action.startsWith("mailto:")) return;

      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var successMsg = form.getAttribute("data-success") || "Thank you! Your message has been sent.";

      /* Simple inline success display */
      if (btn) btn.disabled = true;
      var notice = document.createElement("p");
      notice.textContent = successMsg;
      notice.style.cssText = "color:#16a34a;font-weight:600;margin-top:12px";
      form.appendChild(notice);
    });
  });
})();
`;
}

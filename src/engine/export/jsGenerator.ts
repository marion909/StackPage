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
      var successMsg = form.getAttribute("data-success") || "Thank you! Your message has been sent.";

      /* Netlify and mailto are handled natively by the browser */
      if (action.startsWith("mailto:") || form.hasAttribute("data-netlify")) return;

      /* Formspree: submit via fetch for a smooth UX without page reload */
      if (form.hasAttribute("data-sp-formspree") && action) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

        var data = new FormData(form);
        fetch(action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        })
          .then(function (res) {
            if (res.ok) {
              form.reset();
              var notice = document.createElement("p");
              notice.textContent = successMsg;
              notice.style.cssText = "color:#16a34a;font-weight:600;margin-top:12px";
              form.appendChild(notice);
              if (btn) btn.style.display = "none";
            } else {
              return res.json().then(function (json) {
                var msg = (json && json.errors && json.errors.map(function (err) { return err.message; }).join(", ")) || "Something went wrong. Please try again.";
                var errEl = document.createElement("p");
                errEl.textContent = msg;
                errEl.style.cssText = "color:#dc2626;font-weight:600;margin-top:12px";
                form.appendChild(errEl);
                if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Send Message"; }
              });
            }
          })
          .catch(function () {
            var errEl = document.createElement("p");
            errEl.textContent = "Network error. Please check your connection and try again.";
            errEl.style.cssText = "color:#dc2626;font-weight:600;margin-top:12px";
            form.appendChild(errEl);
            if (btn) { btn.disabled = false; }
          });
        return;
      }

      /* Fallback: prevent default and show success message */
      e.preventDefault();
      var btn2 = form.querySelector('button[type="submit"]');
      var notice2 = document.createElement("p");
      notice2.textContent = successMsg;
      notice2.style.cssText = "color:#16a34a;font-weight:600;margin-top:12px";
      form.appendChild(notice2);
      if (btn2) btn2.disabled = true;
    });
  });

  /* ── Dark mode toggle ── */
  (function () {
    var stored = localStorage.getItem("sp-theme");
    if (stored === "dark" || (!stored && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    document.querySelectorAll("[data-sp-dark-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
        localStorage.setItem("sp-theme", isDark ? "light" : "dark");
        btn.textContent = isDark ? "🌙" : "☀";
      });
      btn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀" : "🌙";
    });
  })();

  /* ── Scroll animations ── */
  if (typeof IntersectionObserver !== "undefined") {
    var animStyles = document.createElement("style");
    animStyles.textContent = [
      "[data-anim]{opacity:0;transition:opacity 0.6s ease,transform 0.6s ease;}",
      "[data-anim='fade-in']{transform:none}",
      "[data-anim='slide-up']{transform:translateY(40px)}",
      "[data-anim='slide-left']{transform:translateX(-40px)}",
      "[data-anim='slide-right']{transform:translateX(40px)}",
      "[data-anim='zoom-in']{transform:scale(0.88)}",
      "[data-anim].sp-anim-active{opacity:1;transform:none!important}",
    ].join("");
    document.head.appendChild(animStyles);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("sp-anim-active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-anim]").forEach(function (el) { observer.observe(el); });
  }
})();
`;
}

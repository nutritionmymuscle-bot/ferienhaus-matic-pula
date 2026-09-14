/* ==========================================================================
   Ferienhaus Matić Pula — Comportements généraux du site
   (navigation mobile, lien actif, témoignages dynamiques, filtres galerie,
   bouton WhatsApp, bannière cookies)
   ========================================================================== */

const STAR_ICON_FILLED =
  '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.5l2.6 5.44 5.9.7-4.4 4.2 1.1 5.96L10 15.9l-5.2 2.9 1.1-5.96-4.4-4.2 5.9-.7L10 1.5z"/></svg>';

// 👉 Remplace ce numéro par le vrai numéro WhatsApp du propriétaire
// (format international, sans "+", sans espaces, ex: "491793590317").
const WHATSAPP_PHONE = "491793590317";

const COOKIE_CONSENT_KEY = "fhm_cookie_consent";

function initNavToggle() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function markCurrentNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a[data-page]").forEach((link) => {
    if (link.getAttribute("data-page") === current) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }
  });
}

function setFooterYear() {
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function buildTestimonialCard(item) {
  const initials = item.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const stars = Array.from({ length: 5 })
    .map((_, i) => (i < item.rating ? STAR_ICON_FILLED : ""))
    .join("");
  return `
    <article class="testimonial-card">
      <div class="testimonial-stars">${stars}</div>
      <p class="testimonial-text">“${item.text}”</p>
      <div class="testimonial-author">
        <span class="testimonial-avatar">${initials}</span>
        <span>
          <span class="testimonial-name">${item.name}</span><br>
          <span class="testimonial-country">${item.country}</span>
        </span>
      </div>
    </article>`;
}

function renderTestimonials() {
  const lang = getCurrentLang();
  const list = (TRANSLATIONS[lang] && TRANSLATIONS[lang].testimonials && TRANSLATIONS[lang].testimonials.list) || [];
  document.querySelectorAll("[data-testimonials-grid]").forEach((container) => {
    const limit = container.getAttribute("data-limit");
    const items = limit ? list.slice(0, parseInt(limit, 10)) : list;
    container.innerHTML = items.map(buildTestimonialCard).join("");
  });
}

function initGalleryFilters() {
  const filterBar = document.querySelector("[data-gallery-filters]");
  const items = document.querySelectorAll("[data-gallery-item]");
  if (!filterBar || !items.length) return;
  filterBar.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.getAttribute("data-filter");
      items.forEach((item) => {
        const category = item.getAttribute("data-gallery-item");
        item.hidden = filter !== "all" && category !== filter;
      });
    });
  });
}

function initGalleryLightbox() {
  const grid = document.querySelector(".gallery-grid");
  if (!grid || typeof Lightbox === "undefined") return;
  grid.addEventListener("click", (evt) => {
    const img = evt.target.closest(".gallery-item img");
    if (!img) return;
    const visibleItems = Array.from(grid.querySelectorAll(".gallery-item:not([hidden])"));
    const urls = visibleItems.map((item) => item.querySelector("img").getAttribute("src"));
    const captions = visibleItems.map((item) => item.querySelector("figcaption")?.textContent.trim() || "");
    const clickedItem = img.closest(".gallery-item");
    const startIndex = visibleItems.indexOf(clickedItem);
    Lightbox.open(urls, startIndex, captions);
  });
}

const APARTMENT_PHOTO_SETS = {
  apt1: Array.from({ length: 16 }, (_, i) => `images/appartement-1/photo-${String(i + 1).padStart(2, "0")}.png`),
  apt2: [
    ...Array.from({ length: 12 }, (_, i) => `images/appartement-2/photo-${String(i + 1).padStart(2, "0")}.png`),
    "images/appartement-2/photo-13.jpeg",
  ],
  apt3: Array.from({ length: 14 }, (_, i) => `images/appartement-3/photo-${String(i + 1).padStart(2, "0")}.png`),
};

function initApartmentPhotoLightbox() {
  if (typeof Lightbox === "undefined") return;
  document.querySelectorAll("[data-apartment-gallery]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const apartmentId = btn.getAttribute("data-apartment-gallery");
      const urls = APARTMENT_PHOTO_SETS[apartmentId];
      if (urls) Lightbox.open(urls, 0);
    });
  });
}

function buildFAQItem(item) {
  return `
    <div class="faq-item">
      <button type="button" class="faq-question" aria-expanded="false">
        <span>${item.q}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-answer"><p>${item.a}</p></div>
    </div>`;
}

function renderFAQ() {
  const lang = getCurrentLang();
  const list = (TRANSLATIONS[lang] && TRANSLATIONS[lang].faq && TRANSLATIONS[lang].faq.list) || [];
  document.querySelectorAll("[data-faq-list]").forEach((container) => {
    container.innerHTML = list.map(buildFAQItem).join("");
    container.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      question.addEventListener("click", () => {
        const wasOpen = item.classList.contains("is-open");
        container.querySelectorAll(".faq-item").forEach((el) => {
          el.classList.remove("is-open");
          el.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
}

function updateWhatsappLinks() {
  const lang = getCurrentLang();
  const message = t("common.whatsappMessage", lang);
  const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    link.setAttribute("href", href);
  });
}

function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  const acceptBtn = document.getElementById("cookieBannerAccept");
  if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
    banner.hidden = false;
  }
  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      banner.hidden = true;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  markCurrentNavLink();
  setFooterYear();
  renderTestimonials();
  initGalleryFilters();
  initGalleryLightbox();
  initApartmentPhotoLightbox();
  renderFAQ();
  updateWhatsappLinks();
  initCookieBanner();
});

document.addEventListener("i18n:applied", () => {
  renderTestimonials();
  renderFAQ();
  updateWhatsappLinks();
});

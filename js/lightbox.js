/* ==========================================================================
   Ferienhaus Matić Pula — Visionneuse photo plein écran (galerie + appartements)
   Utilisation : Lightbox.open(listeUrls, indexDeDepart, listeLegendes)
   ========================================================================== */

const Lightbox = (() => {
  let images = [];
  let captions = [];
  let currentIndex = 0;
  let overlay, imgEl, counterEl, captionEl, triggerEl;

  function ensureDOM() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Photo précédente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <figure class="lightbox-figure">
        <img class="lightbox-image" alt="">
        <figcaption class="lightbox-caption"></figcaption>
      </figure>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Photo suivante">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector(".lightbox-image");
    counterEl = overlay.querySelector(".lightbox-counter");
    captionEl = overlay.querySelector(".lightbox-caption");

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => show(currentIndex - 1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => show(currentIndex + 1));
    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) close();
    });
    document.addEventListener("keydown", (evt) => {
      if (overlay.hidden) return;
      if (evt.key === "Escape") close();
      if (evt.key === "ArrowLeft") show(currentIndex - 1);
      if (evt.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  function show(index) {
    currentIndex = (index + images.length) % images.length;
    imgEl.src = images[currentIndex];
    const caption = captions[currentIndex] || "";
    imgEl.alt = caption;
    captionEl.textContent = caption;
    captionEl.hidden = !caption;
    counterEl.textContent = images.length > 1 ? `${currentIndex + 1} / ${images.length}` : "";
    const multi = images.length > 1;
    overlay.querySelector(".lightbox-prev").hidden = !multi;
    overlay.querySelector(".lightbox-next").hidden = !multi;
  }

  function open(urls, startIndex, urlCaptions) {
    if (!urls || !urls.length) return;
    ensureDOM();
    images = urls;
    captions = urlCaptions || [];
    triggerEl = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    show(startIndex || 0);
    overlay.querySelector(".lightbox-close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (triggerEl && typeof triggerEl.focus === "function") triggerEl.focus();
  }

  return { open, close };
})();

/* ==========================================================================
   Ferienhaus Matić Pula — Moteur d'internationalisation (i18n)
   Applique les traductions de translations.js sur toutes les pages via
   des attributs data-i18n / data-i18n-placeholder / data-i18n-aria-label.
   ========================================================================== */

const SUPPORTED_LANGS = ["de", "en", "hr"];
const DEFAULT_LANG = "de";
const LANG_STORAGE_KEY = "fhm_lang";

/** Résout une clé en notation pointée ("nav.home") dans un objet de traduction. */
function resolveKey(obj, key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

/** Traduit une clé pour la langue donnée, avec repli EN puis la clé brute. */
function t(key, lang) {
  const currentLang = lang || getCurrentLang();
  const dict = TRANSLATIONS[currentLang];
  let value = dict ? resolveKey(dict, key) : undefined;
  if (value === undefined) value = resolveKey(TRANSLATIONS.en, key);
  if (value === undefined) return key;
  return value;
}

function detectBrowserLang() {
  const nav = (navigator.language || navigator.userLanguage || "").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(nav) ? nav : null;
}

function getCurrentLang() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  return detectBrowserLang() || DEFAULT_LANG;
}

/** Applique les traductions à tous les éléments annotés du DOM courant. */
function applyTranslations(lang) {
  const currentLang = lang || getCurrentLang();
  document.documentElement.setAttribute("lang", currentLang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(el.getAttribute("data-i18n"), currentLang);
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = t(el.getAttribute("data-i18n-placeholder"), currentLang);
    if (typeof value === "string") el.setAttribute("placeholder", value);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const value = t(el.getAttribute("data-i18n-aria-label"), currentLang);
    if (typeof value === "string") el.setAttribute("aria-label", value);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const value = t(el.getAttribute("data-i18n-title"), currentLang);
    if (typeof value === "string") el.setAttribute("title", value);
  });

  const metaKey = document.body.getAttribute("data-i18n-meta");
  if (metaKey) {
    const titleValue = t("meta." + metaKey, currentLang);
    if (typeof titleValue === "string") document.title = titleValue;
  }

  document.querySelectorAll("[data-lang-select]").forEach((select) => {
    select.value = currentLang;
  });

  document.dispatchEvent(new CustomEvent("i18n:applied", { detail: { lang: currentLang } }));
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyTranslations(lang);
}

function initI18n() {
  applyTranslations(getCurrentLang());
  document.querySelectorAll("[data-lang-select]").forEach((select) => {
    select.addEventListener("change", () => setLanguage(select.value));
  });
}

document.addEventListener("DOMContentLoaded", initI18n);

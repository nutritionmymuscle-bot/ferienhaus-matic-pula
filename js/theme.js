/* ==========================================================================
   Ferienhaus Matić Pula — Bascule thème clair / sombre
   L'attribut data-theme est déjà posé au plus tôt par le script inline dans
   <head> (voir index.html) pour éviter un flash ; ce fichier ne fait que
   brancher le bouton et persister le choix de l'utilisateur.
   ========================================================================== */

const THEME_STORAGE_KEY = "fhm_theme";

function getStoredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" || saved === "dark" ? saved : null;
}

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
}

function setTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

function initThemeToggle() {
  applyTheme(getCurrentTheme());
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
  });

  if (!getStoredTheme() && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (evt) => {
      if (!getStoredTheme()) applyTheme(evt.matches ? "dark" : "light");
    });
  }
}

document.addEventListener("DOMContentLoaded", initThemeToggle);

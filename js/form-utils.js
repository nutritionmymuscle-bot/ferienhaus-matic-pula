/* ==========================================================================
   Ferienhaus Matić Pula — Fonctions partagées par les formulaires
   (réservation et contact) : validation, affichage d'erreurs, envoi EmailJS.
   ========================================================================== */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFieldValue(form, name) {
  return form.elements[name] ? form.elements[name].value.trim() : "";
}

function showFieldError(field, message) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.add("has-error");
  const errorEl = wrapper.querySelector(".field-error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return;
  wrapper.classList.remove("has-error");
  const errorEl = wrapper.querySelector(".field-error");
  if (errorEl) errorEl.textContent = "";
}

function showNotice(notice, type, message) {
  if (!notice) return;
  notice.hidden = false;
  notice.className = `form-notice form-notice--${type}`;
  notice.textContent = message;
  notice.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function sendViaEmailJsOrDemo(templateParams, dict, notice, onDone) {
  if (typeof emailjs !== "undefined" && isEmailJsConfigured()) {
    emailjs
      .send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(() => onDone(true))
      .catch((err) => {
        console.error("EmailJS error:", err);
        onDone(false);
      });
  } else {
    console.info("[Mode démonstration] EmailJS n'est pas configuré. Données qui auraient été envoyées :", templateParams);
    showNotice(notice, "info", dict.demoModeNotice);
    window.setTimeout(() => onDone(true), 900);
  }
}

/** Remplace les jetons "{cle}" d'un gabarit texte par les valeurs de `data`. */
function fillTemplate(str, data) {
  return str.replace(/\{(\w+)\}/g, (match, key) => (data[key] !== undefined ? data[key] : match));
}

/**
 * Envoie une confirmation automatique au CLIENT (2e template EmailJS, optionnel).
 * N'a aucun effet tant que EMAILJS_CONFIG.clientTemplateId n'est pas configuré
 * (voir js/emailjs-config.js et le README) — n'affiche donc rien en mode démo.
 */
function sendClientConfirmationEmail(baseParams, subjectTemplate, bodyTemplate, data) {
  if (typeof emailjs === "undefined" || !isEmailJsConfigured() || !isClientConfirmationConfigured()) return;
  const clientParams = Object.assign({}, baseParams, {
    subject: fillTemplate(subjectTemplate, data),
    client_message: fillTemplate(bodyTemplate, data),
  });
  emailjs
    .send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.clientTemplateId, clientParams)
    .catch((err) => console.error("EmailJS client confirmation error:", err));
}

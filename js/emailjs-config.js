/* ==========================================================================
   Ferienhaus Matić Pula — Configuration EmailJS
   👉 À FAIRE : crée un compte gratuit sur https://www.emailjs.com puis
   remplace les valeurs ci-dessous par les tiennes (voir README.md,
   section "Configurer l'envoi des emails").
   Tant que publicKey / serviceId / templateId commencent par "YOUR_", le
   site fonctionne en MODE DÉMONSTRATION : les formulaires affichent un
   succès simulé et les données sont visibles dans la console du
   navigateur (F12), mais aucun email n'est réellement envoyé.
   ========================================================================== */

const EMAILJS_CONFIG = {
  publicKey: "669t_gxeSBBZGnUU0",
  serviceId: "service_clmqmeu",
  templateId: "template_89ng6br",

  // Optionnel — 2e template EmailJS pour envoyer une confirmation
  // automatique au CLIENT (en plus de l'email que tu reçois toi-même).
  // Voir README, section "Confirmation automatique envoyée au client".
  clientTemplateId: "YOUR_CLIENT_TEMPLATE_ID",
};

function isEmailJsConfigured() {
  return ["publicKey", "serviceId", "templateId"].every(
    (key) => EMAILJS_CONFIG[key] && !EMAILJS_CONFIG[key].startsWith("YOUR_")
  );
}

function isClientConfirmationConfigured() {
  return Boolean(EMAILJS_CONFIG.clientTemplateId && !EMAILJS_CONFIG.clientTemplateId.startsWith("YOUR_"));
}

document.addEventListener("DOMContentLoaded", () => {
  if (isEmailJsConfigured() && typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }
});

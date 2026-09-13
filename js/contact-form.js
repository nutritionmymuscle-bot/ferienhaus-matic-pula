/* ==========================================================================
   Ferienhaus Matić Pula — Formulaire de contact (validation + envoi email)
   Réutilise EMAILJS_CONFIG et le même template que le formulaire de réservation.
   ========================================================================== */

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const notice = document.getElementById("contactFormNotice");
  const submitBtn = document.getElementById("contactSubmitBtn");

  form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const lang = getCurrentLang();
    const dict = TRANSLATIONS[lang].contact;

    // Piège à robots : ce champ est invisible pour un humain, seul un bot le remplit.
    if (getFieldValue(form, "website")) {
      showNotice(notice, "success", dict.successMessage);
      form.reset();
      return;
    }

    let valid = true;

    ["fullName", "email", "message"].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      clearFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, dict.validationRequired);
        valid = false;
      }
    });

    const emailField = form.elements["email"];
    if (emailField && emailField.value.trim() && !validateEmail(emailField.value.trim())) {
      showFieldError(emailField, dict.validationEmail);
      valid = false;
    }

    if (!valid) return;

    const guestFullName = getFieldValue(form, "fullName");

    const templateParams = {
      subject: getFieldValue(form, "subject") || "Nouveau message — Ferienhaus Matić Pula",
      apartment_name: "",
      from_name: guestFullName,
      from_email: getFieldValue(form, "email"),
      phone: "",
      adults: "",
      children: "",
      checkin: "",
      checkout: "",
      nights: "",
      price_per_night: "",
      subtotal: "",
      cleaning_fee: "",
      total_price: "",
      message: getFieldValue(form, "message"),
      lang,
    };

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = dict.submitting;

    sendViaEmailJsOrDemo(templateParams, dict, notice, (success) => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      if (success) {
        sendClientConfirmationEmail(templateParams, dict.clientConfirmationSubject, dict.clientConfirmationBody, {
          name: guestFullName,
        });
        showNotice(notice, "success", dict.successMessage);
        form.reset();
      } else {
        showNotice(notice, "error", dict.errorMessage);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initContactForm);

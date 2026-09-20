/* ==========================================================================
   Ferienhaus Matić Pula — Formulaire "Laisser un avis" (validation + envoi email)
   Réutilise EMAILJS_CONFIG et le même template que les autres formulaires.
   Les avis ne sont pas publiés automatiquement : ils sont envoyés par email
   au propriétaire, qui les ajoute ensuite manuellement dans translations.js
   (testimonials.list) après vérification.
   ========================================================================== */

function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;
  const notice = document.getElementById("reviewFormNotice");
  const submitBtn = document.getElementById("reviewSubmitBtn");

  form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const lang = getCurrentLang();
    const dict = TRANSLATIONS[lang].reviewForm;

    // Piège à robots : ce champ est invisible pour un humain, seul un bot le remplit.
    if (getFieldValue(form, "website")) {
      showNotice(notice, "success", dict.successMessage);
      form.reset();
      return;
    }

    let valid = true;

    ["fullName", "text"].forEach((name) => {
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

    const ratingField = form.elements["rating"];
    clearFieldError(ratingField);
    if (!ratingField.value) {
      showFieldError(ratingField, dict.validationRating);
      valid = false;
    }

    if (!valid) return;

    const guestFullName = getFieldValue(form, "fullName");
    const rating = getFieldValue(form, "rating");
    const country = getFieldValue(form, "country");
    const stars = "★".repeat(Number(rating) || 0) + "☆".repeat(5 - (Number(rating) || 0));

    const templateParams = {
      subject: "Nouvel avis client — Ferienhaus Matić Pula",
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
      message: `Note : ${stars} (${rating}/5)\nPays : ${country || "-"}\n\n${getFieldValue(form, "text")}`,
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

document.addEventListener("DOMContentLoaded", initReviewForm);

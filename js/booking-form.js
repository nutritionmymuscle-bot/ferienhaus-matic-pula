/* ==========================================================================
   Ferienhaus Matić Pula — Formulaire de réservation (validation + envoi email)
   Dépend de js/form-utils.js, js/calendar.js et js/emailjs-config.js.
   ========================================================================== */

function initBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const notice = document.getElementById("bookingFormNotice");
  const submitBtn = document.getElementById("bookingSubmitBtn");
  const consentError = document.getElementById("consentError");

  form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const lang = getCurrentLang();
    const dict = TRANSLATIONS[lang].reservation;

    // Piège à robots : ce champ est invisible pour un humain, seul un bot le remplit.
    if (getFieldValue(form, "website")) {
      showNotice(notice, "success", dict.successMessage);
      form.reset();
      return;
    }

    let valid = true;

    ["firstName", "lastName", "email"].forEach((name) => {
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

    const consentField = form.elements["consent"];
    if (consentField && !consentField.checked) {
      valid = false;
      if (consentError) consentError.textContent = dict.validationConsent;
    } else if (consentError) {
      consentError.textContent = "";
    }

    const booking = window.currentBooking;
    if (!booking || !booking.checkin || !booking.checkout || !booking.valid) {
      valid = false;
      showNotice(notice, "error", dict.validationDates);
    }

    if (!valid) return;

    const apartmentName =
      (TRANSLATIONS[lang].apartments[booking.apartmentId] && TRANSLATIONS[lang].apartments[booking.apartmentId].name) ||
      booking.apartmentId;
    const guestFirstName = getFieldValue(form, "firstName");

    const templateParams = {
      subject: `Nouvelle demande de réservation — Appartement ${apartmentName} — Ferienhaus Matić Pula`,
      apartment_name: apartmentName,
      from_name: `${guestFirstName} ${getFieldValue(form, "lastName")}`,
      from_email: getFieldValue(form, "email"),
      phone: getFieldValue(form, "phone"),
      adults: getFieldValue(form, "adults"),
      children: getFieldValue(form, "children") || "0",
      checkin: booking.checkin,
      checkout: booking.checkout,
      nights: booking.nights,
      price_per_night: `${booking.avgPerNight} ${booking.currency}`,
      subtotal: `${booking.subtotal} ${booking.currency}`,
      cleaning_fee: `${booking.cleaningFee} ${booking.currency}`,
      total_price: `${booking.total} ${booking.currency}`,
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
          name: guestFirstName,
          apartment: apartmentName,
          checkin: formatDisplayDate(booking.checkin, lang),
          checkout: formatDisplayDate(booking.checkout, lang),
          nights: booking.nights,
          total: `${booking.total} ${booking.currency}`,
        });
        showNotice(notice, "success", dict.successMessage);
        form.reset();
        bookingState.start = null;
        bookingState.end = null;
        renderCalendar();
        updateSummary();
      } else {
        showNotice(notice, "error", dict.errorMessage);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initBookingForm);

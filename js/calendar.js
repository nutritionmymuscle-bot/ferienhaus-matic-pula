/* ==========================================================================
   Ferienhaus Matić Pula — Calendrier de réservation + calcul automatique du prix
   La maison compte 3 appartements indépendants ("apt1", "apt2", "apt3"),
   chacun avec son propre calendrier, ses propres tarifs et ses propres
   disponibilités (voir js/pricing-config.js et js/availability-config.js).
   ========================================================================== */

const LOCALE_MAP = { fr: "fr-FR", de: "de-DE", en: "en-GB", hr: "hr-HR" };

function getInitialApartmentId() {
  const params = new URLSearchParams(window.location.search);
  const apt = params.get("apt");
  if (apt === "1" || apt === "apt1") return "apt1";
  if (apt === "2" || apt === "apt2") return "apt2";
  if (apt === "3" || apt === "apt3") return "apt3";
  return "apt1";
}

const bookingState = {
  apartmentId: getInitialApartmentId(),
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(), // 0-11, mois affiché en premier (le suivant est affiché à côté)
  start: null, // "AAAA-MM-JJ"
  end: null,   // "AAAA-MM-JJ"
};

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return toISODate(new Date());
}

function daysBetween(startIso, endIso) {
  const start = new Date(startIso + "T00:00:00");
  const end = new Date(endIso + "T00:00:00");
  return Math.round((end - start) / 86400000);
}

function addNights(startIso, count) {
  const d = new Date(startIso + "T00:00:00");
  d.setDate(d.getDate() + count);
  return toISODate(d);
}

/** Vérifie que toutes les nuits entre start (inclus) et end (exclu) sont disponibles. */
function rangeIsAvailable(apartmentId, startIso, endIso) {
  const nights = daysBetween(startIso, endIso);
  for (let i = 0; i < nights; i++) {
    const night = addNights(startIso, i);
    if (isDateUnavailable(apartmentId, night)) return false;
  }
  return true;
}

function formatDisplayDate(iso, lang) {
  const locale = LOCALE_MAP[lang] || "en-GB";
  const date = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function buildMonthGrid(year, month, lang, apartmentId) {
  const dict = TRANSLATIONS[lang] && TRANSLATIONS[lang].reservation ? TRANSLATIONS[lang].reservation : TRANSLATIONS.en.reservation;
  const monthNames = dict.monthNames;
  const dayNames = dict.dayNamesShort;
  const today = todayISO();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmpty = (firstOfMonth.getDay() + 6) % 7; // lundi = 0

  let cells = "";
  for (let i = 0; i < leadingEmpty; i++) {
    cells += `<div class="calendar-day is-empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const iso = toISODate(date);
    const isPast = iso < today;
    const isUnavailable = !isPast && isDateUnavailable(apartmentId, iso);
    const isAvailable = !isPast && !isUnavailable;
    const isToday = iso === today;
    const isSelectedStart = iso === bookingState.start;
    const isSelectedEnd = iso === bookingState.end;
    const isInRange = bookingState.start && bookingState.end && iso > bookingState.start && iso < bookingState.end;

    let classes = "calendar-day";
    if (isPast) classes += " is-past";
    else if (isUnavailable) classes += " is-unavailable";
    else classes += " is-available";
    if (isToday) classes += " is-today";
    if (isSelectedStart) classes += " is-selected-start";
    if (isSelectedEnd) classes += " is-selected-end";
    if (isInRange) classes += " is-in-range";

    const disabled = isPast || isUnavailable ? "disabled" : "";
    cells += `<button type="button" class="${classes}" data-date="${iso}" ${disabled}>${day}</button>`;
  }

  const label = `${monthNames[month]} ${year}`;
  return `
    <div>
      <div class="calendar-month-label">${label}</div>
      <div class="calendar-weekdays">${dayNames.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="calendar-days">${cells}</div>
    </div>`;
}

function renderCalendar() {
  const container = document.getElementById("calendarMonths");
  if (!container) return;
  const lang = getCurrentLang();
  const { viewYear, viewMonth, apartmentId } = bookingState;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  container.innerHTML =
    buildMonthGrid(viewYear, viewMonth, lang, apartmentId) + buildMonthGrid(nextYear, nextMonth, lang, apartmentId);

  const prevBtn = document.getElementById("calPrev");
  if (prevBtn) {
    const now = new Date();
    const isAtCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    prevBtn.disabled = isAtCurrentMonth;
  }
}

function updateSummary() {
  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] && TRANSLATIONS[lang].reservation ? TRANSLATIONS[lang].reservation : TRANSLATIONS.en.reservation;
  const apartmentId = bookingState.apartmentId;
  const aptConfig = getApartmentConfig(apartmentId);
  const checkinEl = document.getElementById("summaryCheckin");
  const checkoutEl = document.getElementById("summaryCheckout");
  const breakdownEl = document.getElementById("priceBreakdown");
  const promptEl = document.getElementById("selectDatesPrompt");
  const minNightsNote = document.getElementById("minNightsNote");
  if (!breakdownEl) return;

  if (checkinEl) checkinEl.textContent = bookingState.start ? formatDisplayDate(bookingState.start, lang) : "—";
  if (checkoutEl) checkoutEl.textContent = bookingState.end ? formatDisplayDate(bookingState.end, lang) : "—";

  if (minNightsNote) minNightsNote.textContent = dict.minNightsNotice.replace("{n}", aptConfig.minNights);

  if (!bookingState.start || !bookingState.end) {
    breakdownEl.hidden = true;
    if (promptEl) promptEl.hidden = false;
    updateSubmitAvailability(false);
    return;
  }

  const nights = daysBetween(bookingState.start, bookingState.end);
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    subtotal += getPriceForDate(apartmentId, addNights(bookingState.start, i));
  }
  const avgPerNight = Math.round(subtotal / nights);
  const total = subtotal + aptConfig.cleaningFee;
  const currency = PRICING_CONFIG.currency;

  breakdownEl.hidden = false;
  if (promptEl) promptEl.hidden = true;

  const belowMinNights = nights < aptConfig.minNights;

  breakdownEl.innerHTML = `
    <div class="price-line"><span>${dict.nightsLabel}</span><span class="value">${nights}</span></div>
    <div class="price-line"><span>${dict.pricePerNightLabel}</span><span class="value">${avgPerNight} ${currency}</span></div>
    <div class="price-line"><span>${dict.subtotalLabel}</span><span class="value">${subtotal} ${currency}</span></div>
    <div class="price-line"><span>${dict.cleaningFeeLabel}</span><span class="value">${aptConfig.cleaningFee} ${currency}</span></div>
    <div class="price-line total"><span>${dict.totalLabel}</span><span class="value">${total} ${currency}</span></div>
    ${belowMinNights ? `<div class="form-notice form-notice--error" style="margin-top:14px;">${dict.minNightsNotice.replace("{n}", aptConfig.minNights)}</div>` : ""}
  `;

  // Expose l'état courant pour booking-form.js
  window.currentBooking = {
    apartmentId,
    checkin: bookingState.start,
    checkout: bookingState.end,
    nights,
    subtotal,
    avgPerNight,
    cleaningFee: aptConfig.cleaningFee,
    total,
    currency,
    valid: !belowMinNights,
  };

  updateSubmitAvailability(!belowMinNights);
}

function updateSubmitAvailability(isValid) {
  const submitBtn = document.getElementById("bookingSubmitBtn");
  if (submitBtn) submitBtn.disabled = !isValid;
  window.currentBooking = window.currentBooking || {};
  window.currentBooking.valid = isValid;
}

function handleCalendarClick(evt) {
  const btn = evt.target.closest(".calendar-day[data-date]");
  if (!btn || btn.disabled) return;
  const iso = btn.getAttribute("data-date");
  const apartmentId = bookingState.apartmentId;

  if (!bookingState.start || (bookingState.start && bookingState.end)) {
    bookingState.start = iso;
    bookingState.end = null;
  } else if (iso <= bookingState.start) {
    bookingState.start = iso;
    bookingState.end = null;
  } else if (!rangeIsAvailable(apartmentId, bookingState.start, iso)) {
    bookingState.start = iso;
    bookingState.end = null;
  } else {
    bookingState.end = iso;
  }

  renderCalendar();
  updateSummary();
}

function switchApartment(apartmentId) {
  if (bookingState.apartmentId === apartmentId) return;
  bookingState.apartmentId = apartmentId;
  bookingState.start = null;
  bookingState.end = null;

  document.querySelectorAll("[data-apartment-tab]").forEach((tab) => {
    const isActive = tab.getAttribute("data-apartment-tab") === apartmentId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  const url = new URL(window.location.href);
  url.searchParams.set("apt", apartmentId.replace("apt", ""));
  window.history.replaceState({}, "", url);

  renderCalendar();
  updateSummary();
}

function initApartmentTabs() {
  const tabs = document.querySelectorAll("[data-apartment-tab]");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchApartment(tab.getAttribute("data-apartment-tab")));
    const isActive = tab.getAttribute("data-apartment-tab") === bookingState.apartmentId;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function initCalendar() {
  const container = document.getElementById("calendarMonths");
  if (!container) return;

  container.addEventListener("click", handleCalendarClick);
  initApartmentTabs();

  const prevBtn = document.getElementById("calPrev");
  const nextBtn = document.getElementById("calNext");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      bookingState.viewMonth -= 1;
      if (bookingState.viewMonth < 0) {
        bookingState.viewMonth = 11;
        bookingState.viewYear -= 1;
      }
      renderCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      bookingState.viewMonth += 1;
      if (bookingState.viewMonth > 11) {
        bookingState.viewMonth = 0;
        bookingState.viewYear += 1;
      }
      renderCalendar();
    });
  }

  renderCalendar();
  updateSummary();
}

document.addEventListener("DOMContentLoaded", initCalendar);
document.addEventListener("i18n:applied", () => {
  renderCalendar();
  updateSummary();
});

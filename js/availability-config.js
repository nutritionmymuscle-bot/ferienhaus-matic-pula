/* ==========================================================================
   Ferienhaus Matić Pula — Configuration des disponibilités
   👉 Une liste de périodes bloquées par appartement ("apt1" | "apt2" | "apt3").
   Le propriétaire modifie UNIQUEMENT ce fichier pour bloquer des dates déjà
   réservées manuellement (par lui-même, par téléphone, sur une autre
   plateforme, etc.). Dates au format "AAAA-MM-JJ", bornes incluses.

   Pour les réservations prises sur Airbnb / Booking.com, préfère la
   synchronisation automatique (voir README, section "Synchronisation des
   calendriers") plutôt que de les recopier ici à la main — elles sont
   stockées séparément dans js/availability-synced.js.
   ========================================================================== */

const UNAVAILABLE_RANGES = {
  // Volontairement vide : le propriétaire gère la disponibilité lui-même
  // par email, sans bloquer de dates sur le calendrier du site.
  apt1: [],
  apt2: [],
  apt3: []
};

/** Indique si une date ISO "AAAA-MM-JJ" est indisponible pour cet appartement. */
function isDateUnavailable(apartmentId, isoDate) {
  const manual = UNAVAILABLE_RANGES[apartmentId] || [];
  const synced = (typeof SYNCED_UNAVAILABLE_RANGES !== "undefined" && SYNCED_UNAVAILABLE_RANGES[apartmentId]) || [];
  return manual.concat(synced).some((range) => isoDate >= range.start && isoDate <= range.end);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { UNAVAILABLE_RANGES, isDateUnavailable };
}

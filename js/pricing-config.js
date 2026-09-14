/* ==========================================================================
   Ferienhaus Matić Pula — Configuration des prix
   👉 La maison compte 3 appartements indépendants, réservables séparément.
   Le propriétaire modifie UNIQUEMENT ce fichier pour changer les tarifs.

   Le prix par nuit ne dépend plus de la saison, mais du nombre de
   personnes : chaque appartement a un prix de base pour une occupation
   standard ("baseOccupancy"), puis un supplément fixe par personne
   au-delà de ce nombre, jusqu'à l'occupation maximale ("maxOccupancy").

   Exemple Appartement 1 : basePrice 180€ pour 6 personnes, extraGuestFee
   50€ → 230€ pour 7 personnes, 280€ pour 8 personnes (maxOccupancy).
   ========================================================================== */

const PRICING_CONFIG = {
  currency: "€",

  apartments: {
    apt1: {
      // Appartement 1 — 3 chambres, jusqu'à 6+2 personnes
      cleaningFee: 35,
      minNights: 2,
      basePrice: 180,
      baseOccupancy: 6,
      maxOccupancy: 8,
      extraGuestFee: 50
    },
    apt2: {
      // Appartement 2 — 3 chambres, jusqu'à 6+2 personnes
      cleaningFee: 40,
      minNights: 2,
      basePrice: 180,
      baseOccupancy: 6,
      maxOccupancy: 8,
      extraGuestFee: 50
    },
    apt3: {
      // Appartement 3 — 2 chambres, jusqu'à 4+1 personnes
      cleaningFee: 35,
      minNights: 2,
      basePrice: 130,
      baseOccupancy: 4,
      maxOccupancy: 5,
      extraGuestFee: 50
    }
  }
};

/** Renvoie la configuration tarifaire d'un appartement ("apt1" | "apt2" | "apt3"). */
function getApartmentConfig(apartmentId) {
  return PRICING_CONFIG.apartments[apartmentId] || PRICING_CONFIG.apartments.apt1;
}

/** Renvoie le prix par nuit (en €) pour un appartement et un nombre de personnes donnés. */
function getPricePerNight(apartmentId, guestCount) {
  const config = getApartmentConfig(apartmentId);
  const cappedGuests = Math.min(Math.max(guestCount, 0), config.maxOccupancy);
  const extraGuests = Math.max(0, cappedGuests - config.baseOccupancy);
  return config.basePrice + extraGuests * config.extraGuestFee;
}

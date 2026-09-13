/* ==========================================================================
   Ferienhaus Matić Pula — Configuration des prix
   👉 La maison compte 3 appartements indépendants (2 chambres + salon
   chacun), réservables séparément. Le propriétaire modifie UNIQUEMENT ce
   fichier pour changer les tarifs de chaque appartement.
   Les dates sont au format "AAAA-MM-JJ". Les périodes ne doivent pas se
   chevaucher. Toute date en dehors des périodes utilise le tarif par défaut.
   ========================================================================== */

const PRICING_CONFIG = {
  currency: "€",

  apartments: {
    apt1: {
      // Appartement 1
      cleaningFee: 35,
      minNights: 2,
      defaultPricePerNight: 70,
      seasons: [
        { label: "Basse saison",   start: "2026-01-01", end: "2026-05-14", pricePerNight: 70 },
        { label: "Moyenne saison", start: "2026-05-15", end: "2026-06-30", pricePerNight: 95 },
        { label: "Haute saison",   start: "2026-07-01", end: "2026-08-31", pricePerNight: 140 },
        { label: "Moyenne saison", start: "2026-09-01", end: "2026-09-30", pricePerNight: 95 },
        { label: "Basse saison",   start: "2026-10-01", end: "2026-12-31", pricePerNight: 70 }
      ]
    },
    apt2: {
      // Appartement 2
      cleaningFee: 40,
      minNights: 2,
      defaultPricePerNight: 75,
      seasons: [
        { label: "Basse saison",   start: "2026-01-01", end: "2026-05-14", pricePerNight: 75 },
        { label: "Moyenne saison", start: "2026-05-15", end: "2026-06-30", pricePerNight: 100 },
        { label: "Haute saison",   start: "2026-07-01", end: "2026-08-31", pricePerNight: 150 },
        { label: "Moyenne saison", start: "2026-09-01", end: "2026-09-30", pricePerNight: 100 },
        { label: "Basse saison",   start: "2026-10-01", end: "2026-12-31", pricePerNight: 75 }
      ]
    },
    apt3: {
      // Appartement 3
      cleaningFee: 35,
      minNights: 2,
      defaultPricePerNight: 65,
      seasons: [
        { label: "Basse saison",   start: "2026-01-01", end: "2026-05-14", pricePerNight: 65 },
        { label: "Moyenne saison", start: "2026-05-15", end: "2026-06-30", pricePerNight: 90 },
        { label: "Haute saison",   start: "2026-07-01", end: "2026-08-31", pricePerNight: 130 },
        { label: "Moyenne saison", start: "2026-09-01", end: "2026-09-30", pricePerNight: 90 },
        { label: "Basse saison",   start: "2026-10-01", end: "2026-12-31", pricePerNight: 65 }
      ]
    }
  }
};

/** Renvoie la configuration tarifaire d'un appartement ("apt1" | "apt2" | "apt3"). */
function getApartmentConfig(apartmentId) {
  return PRICING_CONFIG.apartments[apartmentId] || PRICING_CONFIG.apartments.apt1;
}

/** Renvoie le prix par nuit (en €) pour un appartement et une date ISO "AAAA-MM-JJ" donnés. */
function getPriceForDate(apartmentId, isoDate) {
  const config = getApartmentConfig(apartmentId);
  const season = config.seasons.find((s) => isoDate >= s.start && isoDate <= s.end);
  return season ? season.pricePerNight : config.defaultPricePerNight;
}

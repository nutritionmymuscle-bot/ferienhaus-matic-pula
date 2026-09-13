#!/usr/bin/env node
/* ==========================================================================
   Ferienhaus Matić Pula — Export des disponibilités au format iCal

   Génère un fichier .ics par appartement (dossier ical/) à partir de
   js/availability-config.js (dates bloquées manuellement) et
   js/availability-synced.js (dates déjà synchronisées depuis d'autres
   plateformes), afin de les importer dans Airbnb / Booking.com et
   d'éviter les doubles réservations dans l'autre sens.

   Utilisation :
     node scripts/generate-ical.js

   À relancer chaque fois que tu modifies js/availability-config.js, ou
   après chaque exécution de scripts/sync-ical.js.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const { UNAVAILABLE_RANGES } = require("../js/availability-config.js");
const { SYNCED_UNAVAILABLE_RANGES } = require("../js/availability-synced.js");

const APARTMENT_FILES = { apt1: "appartement-1", apt2: "appartement-2", apt3: "appartement-3" };
const OUTPUT_DIR = path.join(__dirname, "..", "ical");

function addDaysToICSDate(iso, delta) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function toICSDate(iso) {
  return iso.replace(/-/g, "");
}

function buildICS(apartmentId, ranges) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//Ferienhaus Matic Pula//${apartmentId}//FR`, "CALSCALE:GREGORIAN"];
  ranges.forEach((range, i) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${apartmentId}-${range.start}-${i}@ferienhaus-matic-pula.com`,
      // DTEND en "journée entière" est exclusif : on ajoute donc un jour
      // par rapport à la dernière nuit bloquée (range.end, inclus).
      `DTSTART;VALUE=DATE:${toICSDate(range.start)}`,
      `DTEND;VALUE=DATE:${addDaysToICSDate(range.end, 1)}`,
      "SUMMARY:Indisponible",
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

Object.keys(APARTMENT_FILES).forEach((apartmentId) => {
  const manual = UNAVAILABLE_RANGES[apartmentId] || [];
  const synced = SYNCED_UNAVAILABLE_RANGES[apartmentId] || [];
  const merged = manual.concat(synced);
  const ics = buildICS(apartmentId, merged);
  const fileName = `${APARTMENT_FILES[apartmentId]}.ics`;
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), ics, "utf8");
  console.log(`✓ ical/${fileName} (${merged.length} période(s) bloquée(s))`);
});

console.log("\n✅ Fichiers .ics générés dans le dossier ical/.");
console.log("   Héberge-les avec le reste du site, puis colle leur URL publique");
console.log("   dans les paramètres d'import de calendrier d'Airbnb / Booking.com.");

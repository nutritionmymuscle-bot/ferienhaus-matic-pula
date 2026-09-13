#!/usr/bin/env node
/* ==========================================================================
   Ferienhaus Matić Pula — Synchronisation des calendriers externes (iCal)

   Lit les URLs iCal (Airbnb, Booking.com...) définies dans
   scripts/ical-sources.json, télécharge et fusionne les dates déjà
   réservées sur ces plateformes, puis régénère js/availability-synced.js.
   Cela évite qu'un même appartement soit réservé deux fois (une fois sur
   Airbnb/Booking.com, une fois via ce site).

   Utilisation :
     node scripts/sync-ical.js

   Pour l'automatiser (ex. toutes les 6h) : cron, tâche planifiée Windows,
   ou une GitHub Action programmée si le projet est hébergé sur GitHub.
   Nécessite Node.js 18 ou supérieur (fetch natif).
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const SOURCES_PATH = path.join(__dirname, "ical-sources.json");
const OUTPUT_PATH = path.join(__dirname, "..", "js", "availability-synced.js");

function unfoldICS(text) {
  // Les lignes pliées (spec iCal) commencent par une espace ou une tabulation.
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function extractDate(body, prop) {
  const regex = new RegExp(prop + "(;[^:\\r\\n]*)?:([0-9TZ]+)", "i");
  const match = body.match(regex);
  if (!match) return null;
  const raw = match[2];
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function parseICSEvents(text) {
  const unfolded = unfoldICS(text);
  const blocks = unfolded.split("BEGIN:VEVENT").slice(1);
  const events = [];
  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0];
    const dtstart = extractDate(body, "DTSTART");
    const dtend = extractDate(body, "DTEND");
    if (dtstart && dtend) events.push({ start: dtstart, end: dtend });
  }
  return events;
}

function addDays(iso, delta) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

async function fetchICS(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function syncApartment(apartmentId, config) {
  const ranges = [];
  for (const url of config.sources || []) {
    try {
      const text = await fetchICS(url);
      const events = parseICSEvents(text);
      // DTEND en iCal "journée entière" est exclusif : la dernière nuit
      // bloquée est donc la veille de DTEND.
      events.forEach((ev) => ranges.push({ start: ev.start, end: addDays(ev.end, -1) }));
      console.log(`  ✓ ${config.name || apartmentId}: ${events.length} réservation(s) depuis ${url}`);
    } catch (err) {
      console.warn(`  ⚠ ${config.name || apartmentId}: échec de récupération de ${url} (${err.message})`);
    }
  }
  return ranges;
}

async function main() {
  if (!fs.existsSync(SOURCES_PATH)) {
    console.error(`Fichier introuvable : ${SOURCES_PATH}`);
    process.exit(1);
  }
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
  const result = {};

  for (const apartmentId of Object.keys(sources)) {
    const config = sources[apartmentId];
    const totalSources = (config.sources || []).length;
    console.log(`Synchronisation de ${config.name || apartmentId} (${totalSources} source(s))...`);
    result[apartmentId] = await syncApartment(apartmentId, config);
  }

  const output = `/* ==========================================================================
   Ferienhaus Matić Pula — Dates indisponibles synchronisées automatiquement
   👉 Ce fichier est AUTO-GÉNÉRÉ par \`node scripts/sync-ical.js\` à partir des
   calendriers iCal externes (Airbnb, Booking.com...) configurés dans
   \`scripts/ical-sources.json\`. Ne modifie pas ce fichier à la main — tes
   changements seraient écrasés au prochain lancement du script.
   Pour bloquer une date manuellement, utilise plutôt js/availability-config.js.
   Dernière synchronisation : ${new Date().toISOString()}
   ========================================================================== */

const SYNCED_UNAVAILABLE_RANGES = ${JSON.stringify(result, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYNCED_UNAVAILABLE_RANGES };
}
`;

  fs.writeFileSync(OUTPUT_PATH, output, "utf8");
  console.log(`\n✅ js/availability-synced.js mis à jour.`);
}

main();

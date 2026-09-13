# Ferienhaus Matić Pula — Site web

Site multipage pour la location de la **Villa Ferienhaus Matić Pula** (Pula – Istrie, Croatie) : une villa istrienne rénovée divisée en **3 appartements indépendants** — **Appartement 1**, **Appartement 2** et **Appartement 3** — chacun avec 2 chambres et un salon, réservables séparément, autour d'une **piscine commune**.

- 12 pages : Accueil, À propos, Nos appartements, Galerie, Réservation, Localisation, Avis clients, FAQ, Contact, Mentions légales, Confidentialité, Conditions générales
- 4 langues : Français, Deutsch, English, Hrvatski (sélecteur en haut à droite, mémorisé automatiquement)
- **3 appartements réservables séparément**, chacun avec son propre calendrier, ses propres tarifs et ses propres disponibilités
- Calendrier de réservation avec **calcul automatique du prix** (nuits × tarif saisonnier + frais de ménage), par appartement
- Formulaire de réservation qui **t'envoie un email** avec toutes les infos remplies par le client, y compris l'appartement demandé (via EmailJS)
- **Confirmation automatique optionnelle envoyée au client** (email séparé de celui que tu reçois)
- **Synchronisation des calendriers (iCal)** avec Airbnb/Booking.com pour éviter les doubles réservations
- Carte Google Maps intégrée
- Témoignages clients
- FAQ en accordéon (horaires, animaux, caution, annulation, piscine commune, groupes...)
- Bannière de consentement cookies + pages Mentions légales / Confidentialité (RGPD) / Conditions générales
- Bouton flottant WhatsApp
- SEO de base : `robots.txt`, `sitemap.xml`, balises Open Graph / Twitter Card, données structurées schema.org
- 100% HTML/CSS/JS — aucun serveur requis, fonctionne sur n'importe quel hébergement statique

---

## 1. Tester le site en local

Double-clique simplement sur `index.html` — il s'ouvre dans ton navigateur. Pour un rendu identique à celui en ligne (recommandé), lance un petit serveur local :

```bash
# Avec Node.js installé :
npx serve .

# Ou avec Python :
python -m http.server 8080
```

Puis ouvre `http://localhost:8080` (ou le port indiqué).

---

## 2. Configurer l'envoi des emails de réservation (EmailJS)

Tant que ce n'est pas fait, le site fonctionne en **mode démonstration** : les formulaires affichent un message de succès simulé et les données sont visibles dans la console du navigateur (touche `F12`), mais **aucun email n'est réellement envoyé**.

### Étapes (10 minutes, gratuit) :

1. Crée un compte sur **[emailjs.com](https://www.emailjs.com)** (offre gratuite : 200 emails/mois).
2. Dans le tableau de bord, va dans **Email Services** → **Add New Service**, connecte ta boîte email (Gmail, Outlook…). Note l'**ID du service** (ex. `service_abc123`).
3. Va dans **Email Templates** → **Create New Template**. Ce template sert à la fois pour le formulaire de réservation et le formulaire de contact. Utilise ces variables dans le corps du template (glisse-les depuis la liste des variables ou tape-les directement) :

   ```
   Sujet : {{subject}}

   Appartement demandé : {{apartment_name}}

   Nom : {{from_name}}
   Email : {{from_email}}
   Téléphone : {{phone}}

   Arrivée : {{checkin}}
   Départ : {{checkout}}
   Nuits : {{nights}}
   Adultes : {{adults}}
   Enfants : {{children}}

   Prix/nuit : {{price_per_night}}
   Sous-total : {{subtotal}}
   Ménage : {{cleaning_fee}}
   TOTAL : {{total_price}}

   Message :
   {{message}}

   Langue du client : {{lang}}
   ```

   Configure le champ **"To Email"** du template avec ton adresse email (celle où tu veux recevoir les demandes). Note l'**ID du template** (ex. `template_xyz789`).
4. Va dans **Account** → **General**, copie ta **Public Key**.
5. Ouvre le fichier [`js/emailjs-config.js`](js/emailjs-config.js) et remplace les 3 valeurs :

   ```js
   const EMAILJS_CONFIG = {
     publicKey: "ta_public_key",
     serviceId: "service_abc123",
     templateId: "template_xyz789",
   };
   ```

6. Sauvegarde, recharge le site : les formulaires de `reservation.html` et `contact.html` envoient maintenant de vrais emails.

### Confirmation automatique envoyée au client (optionnel)

En plus de l'email que **toi** tu reçois, le site peut aussi envoyer automatiquement un **email de confirmation au client**, dans sa propre langue. Pour l'activer :

1. Dans EmailJS, crée un **2ᵉ template** (**Email Templates** → **Create New Template**).
2. Configure son champ **"To Email"** avec `{{from_email}}` (au lieu de ton adresse — c'est ce qui fait que l'email part vers le client, pas vers toi).
3. Dans le corps du template, utilise simplement :

   ```
   Sujet : {{subject}}

   {{client_message}}
   ```

   Le site construit automatiquement `client_message` dans la langue du client (clés `reservation.clientConfirmationBody` et `contact.clientConfirmationBody` dans [`js/translations.js`](js/translations.js) si tu veux modifier le texte) — un seul template EmailJS suffit donc pour les 4 langues.
4. Note l'**ID de ce template** et ajoute-le dans [`js/emailjs-config.js`](js/emailjs-config.js) :

   ```js
   const EMAILJS_CONFIG = {
     publicKey: "ta_public_key",
     serviceId: "service_abc123",
     templateId: "template_xyz789",        // le template que TU reçois
     clientTemplateId: "template_client99", // le template que le CLIENT reçoit
   };
   ```

Tant que `clientTemplateId` commence par `"YOUR_"`, cette confirmation automatique reste simplement désactivée (le client ne reçoit rien, mais toi tu continues de recevoir tes emails normalement).

---

## 3. Modifier les prix (par appartement)

Fichier : [`js/pricing-config.js`](js/pricing-config.js)

La maison compte 3 appartements — `apt1` (Appartement 1), `apt2` (Appartement 2), `apt3` (Appartement 3) — chacun avec sa **propre** configuration de prix :

```js
const PRICING_CONFIG = {
  currency: "€",
  apartments: {
    apt1: {
      cleaningFee: 35,     // frais de ménage fixes par séjour, pour cet appartement
      minNights: 2,        // séjour minimum pour cet appartement
      defaultPricePerNight: 70,
      seasons: [
        { label: "Basse saison", start: "2026-01-01", end: "2026-05-14", pricePerNight: 70 },
        { label: "Haute saison", start: "2026-07-01", end: "2026-08-31", pricePerNight: 140 },
        // ajoute / modifie librement les périodes, format de date AAAA-MM-JJ
      ],
    },
    apt2: { /* ... mêmes clés, tarifs propres à l'Appartement 2 ... */ },
    apt3: { /* ... mêmes clés, tarifs propres à l'Appartement 3 ... */ },
  },
};
```

Le prix affiché sur le site est recalculé automatiquement dès qu'une période est modifiée, pour l'appartement actuellement sélectionné sur la page de réservation.

---

## 4. Bloquer des dates déjà réservées (par appartement)

Fichier : [`js/availability-config.js`](js/availability-config.js)

```js
const UNAVAILABLE_RANGES = {
  apt1: [ { start: "2026-07-10", end: "2026-07-18" } ], // Appartement 1
  apt2: [ { start: "2026-08-05", end: "2026-08-15" } ], // Appartement 2
  apt3: [ { start: "2026-07-20", end: "2026-07-27" } ], // Appartement 3
};
```

Ajoute une entrée dans le tableau du bon appartement pour chaque séjour déjà réservé (par toi-même, par téléphone, sur une autre plateforme, etc.). Ces dates apparaissent barrées et non sélectionnables dans le calendrier **de cet appartement uniquement** — les deux autres restent inchangés.

> ⚠️ Ce site n'a pas de base de données : il ne bloque pas automatiquement une date après une demande de réservation. Après avoir confirmé une réservation reçue par email, ajoute manuellement les dates ici, dans le bon appartement.

---

## Synchronisation des calendriers (iCal) — éviter les doubles réservations

Si tu loues aussi tes appartements sur Airbnb, Booking.com ou une autre plateforme, deux scripts Node.js (dans `scripts/`) permettent de synchroniser les calendriers dans les deux sens, sans base de données ni serveur. Ils nécessitent seulement **Node.js 18 ou supérieur** installé sur ton ordinateur (aucune dépendance à installer).

### A. Importer les réservations Airbnb/Booking.com vers ce site

1. Sur Airbnb (Calendrier → Disponibilité → Synchroniser les calendriers) ou Booking.com (Tarifs et disponibilités → Synchronisation des calendriers), copie l'**URL d'export iCal** de chaque annonce.
2. Colle ces URLs dans [`scripts/ical-sources.json`](scripts/ical-sources.json), dans le tableau `sources` du bon appartement :

   ```json
   {
     "apt1": { "name": "Appartement 1", "sources": ["https://www.airbnb.com/calendar/ical/XXXXX.ics?s=...", "https://admin.booking.com/.../XXXX.ics"] },
     "apt2": { "name": "Appartement 2", "sources": [] },
     "apt3": { "name": "Appartement 3", "sources": [] }
   }
   ```

3. Lance :

   ```bash
   node scripts/sync-ical.js
   ```

   Cela régénère [`js/availability-synced.js`](js/availability-synced.js) avec les dates déjà réservées ailleurs — elles apparaissent aussitôt bloquées dans le calendrier du site, **en plus** de celles ajoutées à la main dans `availability-config.js`.
4. Relance cette commande régulièrement (manuellement, ou via une tâche planifiée / cron / GitHub Action si tu veux l'automatiser toutes les quelques heures).

### B. Exporter les réservations de ce site vers Airbnb/Booking.com

1. Lance :

   ```bash
   node scripts/generate-ical.js
   ```

   Cela génère un fichier `.ics` par appartement dans le dossier `ical/` (`appartement-1.ics`, `appartement-2.ics`, `appartement-3.ics`), à partir de toutes les dates bloquées (manuelles + synchronisées).
2. Mets ces fichiers en ligne avec le reste du site (ils seront accessibles par ex. à `https://tondomaine.com/ical/appartement-1.ics`).
3. Sur Airbnb/Booking.com, colle cette URL dans leur champ **"Importer un calendrier"** pour cet appartement.
4. Relance ce script (et remets les fichiers en ligne) à chaque changement de disponibilité.

---

## Comment fonctionne le sélecteur d'appartement

Sur `reservation.html`, trois onglets (Appartement 1 / 2 / 3) permettent au client de choisir l'appartement à réserver — chacun a son propre calendrier, ses propres disponibilités et son propre prix. Depuis la page `appartement.html`, chaque bouton "Réserver" ouvre directement `reservation.html?apt=1` (ou `2`, `3`) pour présélectionner le bon onglet.

Pour renommer les appartements (par exemple si tu préfères leur donner un nom propre plutôt qu'un numéro), modifie uniquement `TRANSLATIONS.<langue>.apartments.apt1.name` (et `apt2`, `apt3`) dans [`js/translations.js`](js/translations.js), dans les 4 langues — le nom est ensuite repris automatiquement partout sur le site (onglets, cartes, emails).

---

## 5. Ajouter tes vraies photos

Toutes les zones photo du site sont actuellement des **placeholders** (dégradé bleu + icône appareil photo). Pour les remplacer :

1. Dépose tes photos dans le dossier `images/` (crée-le s'il n'existe pas).
2. Dans chaque page HTML, remplace un bloc comme celui-ci :

   ```html
   <div class="img-placeholder img-placeholder--square">
     <svg>...</svg>
     <span data-i18n="gallery.categoryPool"></span>
   </div>
   ```

   par une vraie image :

   ```html
   <img src="images/piscine-1.jpg" alt="Piscine privée du Ferienhaus Matić Pula" style="border-radius:14px;width:100%;aspect-ratio:4/3;object-fit:cover;">
   ```

Les emplacements à remplacer en priorité : la galerie (`galerie.html`), les 3 chambres (`appartement.html`) et la vignette de la page d'accueil.

---

## 6. Localisation Google Maps

Le site affiche déjà l'adresse réelle de la villa (**Uskočka ulica 46, 52100 Pula**) : carte intégrée sur `localisation.html` et en mini-carte sur `index.html`, plus un bouton « Voir sur Google Maps » qui pointe vers la fiche Google Maps du bien.

Si l'adresse change un jour :

1. Va sur [Google Maps](https://maps.google.com), recherche la nouvelle adresse.
2. Clique sur **Partager** → **Intégrer une carte** → copie le lien qui commence par `https://www.google.com/maps/embed?...` (ou utilise simplement `https://www.google.com/maps?q=ADRESSE&output=embed`, sans clé API).
3. Ouvre `localisation.html` (et `index.html` pour la mini-carte), remplace la valeur de `src` de la balise `<iframe>` par ce lien.
4. Mets aussi à jour l'adresse affichée en texte dans [`js/translations.js`](js/translations.js) (clé `location.addressValue`, dans les 4 langues), le lien du bouton « Voir sur Google Maps » dans `localisation.html`, et l'adresse dans le JSON-LD de `index.html`.

---

## 7. Modifier les textes, tarifs affichés ou témoignages

Tout le texte du site (dans les 4 langues) est centralisé dans [`js/translations.js`](js/translations.js). Chaque page utilise des clés (`data-i18n="reservation.title"` par exemple) qui pointent vers ce fichier — il n'y a donc qu'un seul endroit à modifier pour changer un texte dans les 4 langues.

Les témoignages se trouvent dans `TRANSLATIONS.<langue>.testimonials.list` — ajoute, retire ou modifie les entrées (`name`, `country`, `rating` de 1 à 5, `text`).

Les questions de la FAQ se trouvent dans `TRANSLATIONS.<langue>.faq.list` — ajoute, retire ou modifie les entrées (`q` pour la question, `a` pour la réponse) ; l'accordéon sur `faq.html` s'actualise automatiquement, dans les 4 langues.

---

## 8. Mettre le site en ligne

Ce site est 100% statique : dépose l'ensemble du dossier tel quel sur n'importe quel hébergement, par exemple :

- **Netlify / Vercel** : glisser-déposer le dossier sur leur interface, ou connecter un dépôt Git.
- **GitHub Pages** : pousser le dossier dans un dépôt et activer Pages.
- **Hébergement mutualisé classique (OVH, Hostinger…)** : envoyer les fichiers via FTP dans le dossier public du site (souvent `www/` ou `public_html/`).

Aucune base de données, aucun serveur applicatif n'est nécessaire.

---

## 9. Configurer le bouton WhatsApp

Un bouton flottant WhatsApp apparaît en bas à droite de chaque page. Pour qu'il pointe vers ton vrai numéro :

1. Ouvre [`js/main.js`](js/main.js).
2. Remplace la valeur de `WHATSAPP_PHONE` par ton numéro au format international, sans "+" ni espaces (ex. `"491793590317"` pour `+49 179 3590317`). C'est déjà configuré avec le numéro du propriétaire.

Le message pré-rempli est traduit automatiquement dans les 4 langues (clé `common.whatsappMessage` dans [`js/translations.js`](js/translations.js)).

---

## 10. Compléter les pages juridiques (obligatoire avant mise en ligne)

Le site inclut 3 pages juridiques modèles, dans les 4 langues : **Mentions légales** (`mentions-legales.html`), **Politique de confidentialité** (`confidentialite.html`) et **Conditions générales** (`conditions.html`), ainsi qu'une **bannière de consentement cookies** liée à la page de confidentialité.

⚠️ **Ces pages sont des modèles génériques, pas des documents juridiquement validés.** Avant la mise en ligne :

1. Dans [`js/translations.js`](js/translations.js), remplace dans les 4 langues les champs entre crochets de `legal.editorText` (nom du propriétaire, adresse, numéro OIB, téléphone, email) et `legal.hostingText` (nom de l'hébergeur choisi).
2. Relis et adapte les clés `terms.depositText` et `terms.cancellationText` : les pourcentages d'acompte et le barème d'annulation indiqués sont des valeurs par défaut à ajuster selon ta politique réelle.
3. Fais relire l'ensemble par un professionnel (avocat, comptable) — notamment l'Impressum si tu t'adresses à une clientèle germanophone, soumis à des règles strictes en Allemagne/Autriche.

---

## 11. Image de partage (Open Graph) et nom de domaine

Le site inclut des balises Open Graph / Twitter Card pour un bel aperçu quand un lien est partagé sur WhatsApp, Facebook, etc. Il manque deux éléments à ajouter une fois le site en ligne :

1. **Image de partage** : ajoute une photo dans `images/og-cover.jpg` (1200×630 px recommandé — une photo de la piscine ou de la villa fonctionne très bien).
2. **Nom de domaine** : tant que le site n'a pas de nom de domaine définitif, toutes les URLs pointent vers `https://www.ferienhaus-matic-pula.com` à titre d'exemple. Une fois ton domaine réel choisi, remplace cette valeur dans : `robots.txt`, `sitemap.xml`, et les balises `og:url` / `og:image` / `twitter:image` / `<link rel="canonical">` de chaque page HTML (recherche global "ferienhaus-matic-pula.com" dans le dossier).

---

## Structure du projet

```
Ferienhaus-Matic-Pula/
├── index.html              Accueil
├── apropos.html             À propos (histoire, hôtes, région)
├── appartement.html         Nos 3 appartements (Appartement 1, 2, 3)
├── galerie.html             Galerie photos (avec filtres)
├── reservation.html         Sélecteur d'appartement + calendrier + prix + formulaire
├── localisation.html        Carte Google Maps + distances
├── temoignages.html         Avis clients
├── faq.html                  FAQ en accordéon
├── contact.html             Formulaire de contact
├── mentions-legales.html     ⚖️ Mentions légales / Impressum (à compléter)
├── confidentialite.html      ⚖️ Politique de confidentialité (RGPD)
├── conditions.html           ⚖️ Conditions générales de réservation (à ajuster)
├── robots.txt                SEO : indexation des moteurs de recherche
├── sitemap.xml                SEO : plan du site
├── css/
│   └── style.css            Design system (couleurs, typographie, composants)
├── js/
│   ├── translations.js      Tous les textes du site, en 4 langues (dont apartments.apt1/2/3, legal, privacy, terms)
│   ├── i18n.js               Moteur de traduction
│   ├── main.js                Navigation, témoignages, filtres galerie, ⚙️ numéro WhatsApp, bannière cookies
│   ├── pricing-config.js      ⚙️ Tarifs par appartement et par saison (à modifier)
│   ├── availability-config.js ⚙️ Dates bloquées manuellement, par appartement (à modifier)
│   ├── availability-synced.js 🔄 Dates synchronisées depuis Airbnb/Booking.com (auto-généré, ne pas éditer)
│   ├── calendar.js            Sélecteur d'appartement + calendrier + calcul du prix
│   ├── form-utils.js          Fonctions communes aux formulaires (dont confirmation client)
│   ├── emailjs-config.js      ⚙️ Clés EmailJS (à configurer)
│   ├── booking-form.js        Formulaire de réservation
│   └── contact-form.js        Formulaire de contact
├── scripts/
│   ├── ical-sources.json      ⚙️ URLs iCal Airbnb/Booking.com à synchroniser (à compléter)
│   ├── sync-ical.js           🔄 Importe les réservations externes → availability-synced.js
│   └── generate-ical.js       🔄 Exporte les disponibilités du site → dossier ical/
├── ical/                     Fichiers .ics générés (à héberger + importer sur Airbnb/Booking.com)
└── images/                   Tes photos (à ajouter), + og-cover.jpg pour le partage sur les réseaux
```

Les fichiers marqués ⚙️ sont ceux que tu modifieras le plus souvent au quotidien. Les fichiers marqués ⚖️ doivent être complétés/validés avant la mise en ligne (voir section 10).

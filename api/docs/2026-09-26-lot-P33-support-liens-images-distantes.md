# Lot P33 — Support : liens, images distantes et images collées

Audit de sécurité de la production du 25/09/2026, constats PM32, PM54 et PL25 (ticket Linear GOO-84).
Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM32 | moyenne | Formulaire public anonyme (`POST /SNUpport/ticket/form`, `POST /SNUpport/ticket`) → attribut « page précédente » rendu dans la fiche ticket des agents (`left.jsx` Attribute) | `normalizeFromPage` (api) n'accepte plus qu'un chemin relatif ou une URL https dont l'hôte est un front SNU connu, en réutilisant `isInternalRedirectUrl`/`getSafeExternalRedirectUrl` (snu-lib, GOO-9) au lieu d'un simple test de schéma https. Côté snupport-app, `Attribute` (left.jsx) n'émet un lien que via `sanitizeKnownHttpsUrl` (nouvelle fonction, `utils/safeUrl.js`), qui restreint à la même liste de fronts |
| PM54 | moyenne | snupport-app : éditeur de réponse d'un ticket (`Thread` → `TextEditor.insertData`) → `POST /knowledge-base/picture` (bucket public) | l'insertion d'image (fichier collé/déposé ou URL) est refusée dans les éditeurs qui composent un message envoyé à un contact (réponse de ticket, création de ticket, premier message d'un ticket scindé), via une nouvelle prop `allowImages={false}` sur `TextEditor` ; un message d'erreur invite à joindre le fichier plutôt qu'à le coller |
| PL25 | faible | snupport-app : `/ticket/:id` et aperçus → `ChatBox.jsx` (`dangerouslySetInnerHTML` du message assaini) | `htmlCleaner` neutralise toute image distante (`http`/`https`) d'un message entrant : le `src` est déplacé dans l'attribut inerte `iwc-no-src` (déjà présent dans la liste blanche depuis GOO-6/#5361, jamais exploité jusqu'ici). `ChatBox` affiche un bouton « Afficher les images » qui appelle `revealRemoteImages` à la demande de l'agent ; les images collées (`data:`) restent affichées directement |

## 2. Choix

- **PM32 — réutilisation du filtre de redirection (GOO-9) plutôt qu'une nouvelle liste d'hôtes** :
  `getSafeExternalRedirectUrl`/`isInternalRedirectUrl` (`packages/lib/src/utils/request.ts`)
  résolvent exactement le même besoin (« chemin relatif interne, ou URL https vers un front SNU »)
  et sont déjà en production. Le test existant (`moncompte.snu.gouv.fr/phase1` conservé tel quel)
  passe sans changement car cet hôte fait partie de `ALLOWED_REDIRECT_ORIGINS`.
- **snupport-app garde sa propre liste d'hôtes** (`sanitizeKnownHttpsUrl`, copie de
  `ALLOWED_REDIRECT_ORIGINS`) plutôt que d'ajouter une dépendance à snu-lib : snupport-app ne
  dépend pas de snu-lib (cf. l'en-tête de `utils/safeUrl.js`, GOO-19). `sanitizeHttpsUrl` (tout hôte
  https) n'est pas touché : il reste utilisé pour le lien « lien vers profil », toujours construit
  côté serveur depuis `config.ADMIN_URL` (jamais depuis une valeur d'un tiers).
- **PM54 — bloquer l'insertion plutôt que compléter `serialize()`** : ajouter un cas « image » dans
  `importHtml.js` aurait fait que l'image parte réellement au contact, mais n'aurait rien changé à
  la fuite elle-même — le fichier est déjà public (ACL `public-read`, clé prévisible
  `kn/<timestamp>-<nom>`) dès le collage, avant tout envoi. Bloquer l'insertion supprime la
  publication non désirée à la source. Limité aux éditeurs qui envoient effectivement un message à
  un contact (réponse, création de ticket) ; les éditeurs de signature, macro et modèle restent
  inchangés (`allowImages` par défaut à `true`), non couverts par cet audit.
- **PL25 — `iwc-no-src` plutôt qu'un nouvel attribut** : cette clé était déjà dans
  `allowedAttributes.img` depuis GOO-6 (#5361), en anticipation de ce correctif, mais rien ne
  l'utilisait. `revealRemoteImages` repasse par le même `sanitizeHtml`/`CLEANER_OPTIONS` que
  `htmlCleaner` : une valeur glissée directement dans `iwc-no-src` (contournement de la première
  passe) reste filtrée par la même liste de schémas au moment de la restauration.
- **Défense côté serveur ET côté front pour PM32** : `normalizeFromPage` ferme le formulaire public
  et `POST /SNUpport/ticket`, mais `left.jsx` reste la dernière ligne de défense pour un attribut
  qui arriverait autrement dans `contactAttributes` (le mécanisme complémentaire du constat évoque
  la recopie de ces attributs d'un ticket à l'autre pour un même contact).

## 3. Impact fonctionnel

- snupport-app : un agent qui colle ou dépose une image dans une réponse de ticket, un nouveau
  ticket ou un ticket scindé voit un message d'erreur et l'image n'est pas insérée ; il doit joindre
  le fichier comme pièce jointe. Les éditeurs de signature, macro et modèle ne changent pas.
- snupport-app : les images des e-mails entrants ne se chargent plus automatiquement à l'ouverture
  d'un ticket ou de son aperçu ; un bouton « Afficher les images » les révèle à la demande. Un lien
  https d'un attribut de contact vers un hôte hors des fronts SNU s'affiche désormais en texte brut
  au lieu d'un lien cliquable.

## 4. Tâches post-déploiement

- Déploiement : api (`normalizeFromPage`) et snupport-app, sans ordre particulier.
- Aucune migration, aucune variable d'environnement.
- Résiduel signalé par l'audit, hors correctif de ce lot : les `contactAttributes` déjà déposés par
  un lien https vers un hôte hors liste (avant ce correctif) restent en base sur les tickets
  existants ; ils ne sont plus rendus en lien cliquable côté front (PM32 front fermé) mais n'ont pas
  été purgés côté données.
- Résiduel identifié pendant ce correctif, hors périmètre des constats audités : les éditeurs de
  signature, macro et modèle de réponse (`scenes/setting/signature.jsx`, `shortcut.jsx`,
  `template/components/TemplateModal.jsx`) partagent le même composant `TextEditor` et pourraient
  publier une image de la même façon si un agent y colle un fichier ; ils gardent `allowImages` à
  `true` par défaut, non couverts par PM54 tel qu'audité.

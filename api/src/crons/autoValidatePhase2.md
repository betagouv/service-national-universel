# Validation exceptionnelle de la phase 2 — cohortes 2025

Le cron `autoValidatePhase2` s'exécute quotidiennement à **06 h 30 UTC**, sans effet avant le **9 novembre 2026 à 00 h 00 (Europe/Paris)**.

- Périmètre : groupes de cohortes CLE et HTS de l'année 2025, y compris les cohortes archivées ; cohortes identifiées par leur groupe, et non par une recherche de « 2025 » dans leur nom.
- Seuil : `Number(phase2NumberHoursDone) >= 42`. Ce cumul existant comprend les missions terminées et les équivalences validées. Il n'est pas remplacé par 84.
- Exclusions : jeunes déjà validés, désistés (statut général ou phase 2), supprimés ou anonymisés.
- Les mêmes changements qu'à 84 h sont appliqués, dans une transaction : statut, dates, retrait des pièces de préparation militaire et annulation des candidatures `WAITING_VALIDATION` / `WAITING_VERIFICATION`. Les autres candidatures ne sont pas annulées.
- Le seuil habituel de 84 h et son email restent inchangés hors du cron.

## Nouveau template Brevo

Créer et faire valider le contenu du template, puis configurer **`PHASE2_EXCEPTIONAL_VALIDATION_TEMPLATE_ID`** sur le service exécutant les crons. Paramètres transmis : `cta` (lien vers `/phase2`) et `youngFirstName`. Les représentants légaux sont mis en copie selon le fonctionnement habituel.

Sans identifiant de template, la validation a lieu mais les notifications restent en attente. Les envois nécessitent également `MAIL_TRANSPORT=BREVO`, `ENABLE_SENDINBLUE=true` et la clé Brevo habituelle. Aucun ancien template n'est utilisé en remplacement.

La notification n'est marquée envoyée qu'après réception d'un `messageId` Brevo. Les échecs sont repris lors des exécutions suivantes, sans refaire la validation. Un verrou de 15 minutes protège les envois concurrents. Comme pour tout envoi externe, une interruption après acceptation par Brevo mais avant l'enregistrement du succès peut entraîner un doublon lors de la reprise.

## Trace et attestations

`phase2ExceptionalValidation` conserve le motif `2025_42_HOURS`, la date, les heures et la cohorte lors de la validation, ainsi que la date de notification. La date de validation exceptionnelle reste stable lors des recalculs ultérieurs.

L'attestation de phase 2 utilise un libellé de validation exceptionnelle pour ces jeunes, sans certifier 84 heures non réalisées. Le libellé des attestations ordinaires est inchangé. L'accès aux attestations reste fondé sur le statut `VALIDATED`.

## Tests

Depuis `api/` :

```sh
npm test -- --runTestsByPath src/__tests__/crons/autoValidatePhase2.test.ts src/__tests__/phase2-exceptional-certificate.test.ts
```

Avec un MongoDB de test configuré en replica set, ajouter `TEST_MONGO_TRANSACTIONS=true` pour vérifier également les annulations de transaction et les validations concurrentes. Sans cette option, les transactions sont simulées comme dans les autres tests de crons.

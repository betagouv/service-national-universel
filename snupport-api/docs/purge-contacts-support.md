# Suppression RGPD de la trace support (one-shot)

Supprime (hard-delete) la trace support des jeunes supprimés côté SNU : `Contact`,
ses `Ticket`, leurs `Message` et les pièces jointes S3. Aligné sur le « on ne garde
rien » appliqué au jeune côté SNU — on supprime réellement, on ne masque pas.

Les **agents/référents** support ne sont pas touchés (données de personnel, pas du
jeune ; suppression dédiée via `/v0/referent`).

## Procédure

Cible : par **liste d'emails** fournie par SNU (le `Contact` support est clé par email).

1. **Côté SNU** — exporter les emails (jeune + parents) des cohortes, **avant**
   l'anonymisation SNU (sinon les emails y sont déjà masqués) :
   ```bash
   # depuis api/ (repo SNU)
   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
   ```
   Copier le `emails.json` produit vers `snupport-api/`.

2. **mongodump du Mongo support** (opération irréversible).

3. **Côté support** — aperçu puis exécution :
   ```bash
   # depuis snupport-api/
   DRY_RUN=true EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js   # compte, aucune écriture
   EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js                # exécution
   ```

Ordre de suppression par jeune : fichiers S3 → messages → tickets → **contact en
dernier**. Donc rejouable : un re-run après échec partiel reprend proprement (tant
que le contact existe, on le retrouve par son email).

## Limite connue (à tracer)

C'est un **one-shot par lot**. La suppression d'un jeune **au fil de l'eau** côté
admin (`PUT /young/:id/soft-delete`) **ne purge pas** le support : il faudrait pour
cela une route de suppression côté support appelée par le pipeline SNU (fail-closed,
comme Brevo). À implémenter si une couverture continue est requise.

# Suppression RGPD de la trace support (one-shot)

Supprime (hard-delete) la trace support des jeunes supprimés côté SNU : `Contact`,
ses `Ticket`, leurs `Message` et les pièces jointes S3. Aligné sur le « on ne garde
rien » appliqué au jeune côté SNU — on supprime réellement, on ne masque pas.

Les **agents/référents** support ne sont pas touchés (données de personnel, pas du
jeune ; suppression dédiée via `/v0/referent`).

## Procédure

Cible : par **liste d'emails** fournie par SNU (le `Contact` support est clé par email).

> **Ordre impératif : l'export (étape 1) DOIT précéder le run d'anonymisation SNU**
> (`anonymizeOldCohorts.effect.ts`). L'anonymisation détruit les emails **et** leurs
> patches : exporté après coup, le fichier serait quasi vide **sans erreur** et la purge
> raterait toutes ses cibles en silence (seul indice : un compte d'emails anormalement bas).

1. **Côté SNU** — exporter les emails (jeune + parents) des cohortes :
   ```bash
   # depuis api/ (repo SNU)
   OUT_FILE=./emails.json npx tsx src/scripts/exportOldCohortSupportEmails.ts
   ```
   L'export **exclut automatiquement** les emails encore rattachés à un dossier actif
   hors périmètre (fratrie avec un enfant d'une cohorte récente, jeune devenu référent) :
   leur trace support ne doit pas être détruite. Le nombre d'exclus est loggé.

   Transférer `emails.json` vers `snupport-api/` par un **canal chiffré** (pas de
   Slack/mail : PII en clair). Le fichier est créé en 0600 et gitignoré (`emails*.json`).

2. **mongodump du Mongo support** — attention : le dump ne couvre **pas** les pièces
   jointes S3, dont la suppression est définitive.

3. **Côté support** — aperçu puis exécution :
   ```bash
   # depuis snupport-api/
   DRY_RUN=true EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js   # compte, aucune écriture
   EMAILS_FILE=./emails.json node src/scripts/purgeContacts.js                # exécution
   ```

4. **Après la purge** — supprimer le fichier d'emails des deux machines :
   ```bash
   rm api/emails.json snupport-api/emails.json   # puis vérifier `git status` des deux côtés
   ```

Ordre de suppression par jeune : fichiers S3 → messages → tickets → **contact en
dernier**. Donc rejouable : un re-run après échec partiel reprend proprement (tant
que le contact existe, on le retrouve par son email).

## Limite connue (à tracer)

C'est un **one-shot par lot**. La suppression d'un jeune **au fil de l'eau** côté
admin (`PUT /young/:id/soft-delete`) **ne purge pas** le support : il faudrait pour
cela une route de suppression côté support appelée par le pipeline SNU (fail-closed,
comme Brevo). À implémenter si une couverture continue est requise.

# H7 — Fuite du document métier vers Brevo (`api/src/brevo.ts`)

Audit du 2026-09-21, finding H7. Sévérité **high**. Statut après ce lot : **corrigé**.

## Ce que disait l'audit

Deux mécanismes distincts :

1. `sync()` recopie **toutes** les clés du document jeune / référent en attributs de contact Brevo et n'en
   retire que six (`EMAIL`, `PASSWORD`, `__V`, `_ID`, `LASTNAME`, `FIRSTNAME`). Tokens et données de santé
   partent donc vers Brevo, et le jeune **comme ses deux parents** reçoivent les mêmes attributs.
2. `syncContact()` sérialise ce document complet dans le message d'erreur (`JSON.stringify({ res, email,
   attributes, listIds })`), écrit dans les logs applicatifs et envoyé à Sentry. Idem pour les corps de mail
   de `sendEmail` / `sendTemplate` / `sendSMS` capturés en `extra` Sentry.

## État réel du code au 2026-09-22

Le commit `8519340a3` avait déjà traité le **volet journalisation** (mécanisme 2) :

- `syncContact()` ne construit plus son erreur qu'avec `_id`, type, emplacement (`self` / `parent1` /
  `parent2`), `listIds` et le code d'erreur Brevo — jamais l'email ni les attributs ;
- `api()` ne capture plus `options.body` (qui portait le contact complet et la clé d'API) ;
- Sentry est initialisé avec `beforeSend: redactSentryEvent` : les corps de mail capturés en `extra`
  (`{ mail, body }`) ont leurs tokens masqués et leurs emails tronqués, y compris dans `params.cta` et
  `htmlContent`. Vérifié par exécution.
- Une passe `isSensitiveKey()` retirait les tokens des attributs avant envoi à Brevo.

Restait **non corrigé** le cœur du mécanisme 1 : `isSensitiveKey()` ne couvre que les secrets (tokens, mots
de passe, clés). Le module le dit lui-même : *« ce module est un filet de sécurité pour les secrets, pas une
garantie d'absence de PII »*. Le document jeune compte **335 champs** ; tous ceux qui ne sont pas un secret
continuaient de partir chez Brevo.

## Reproduction

Test `api/src/__tests__/brevo-sync.test.ts`, bloc `H7 - fuite du document métier vers Brevo`.
Avant correction, le corps envoyé à `POST /v3/contacts` pour le contact **parent1** contenait :

```json
{"STATUS":"VALIDATED","COHORT":"Juillet 2024","DEPARTMENT":"Finistère","REGION":"Bretagne",
 "HANDICAP":"true","ALLERGIES":"Allergie aux arachides","PPSBENEFICIARY":"true","PAIBENEFICIARY":"true",
 "MEDICOSOCIALSTRUCTURENAME":"IME Les Tilleuls","MEDICOSOCIALSTRUCTUREADDRESS":"3 rue des Lilas",
 "SPECIFICAMENAGMENT":"true","SPECIFICAMENAGMENTTYPE":"Besoin d'un accompagnant permanent","PSC1INFO":"true",
 "BIRTHDATEAT":"2008-04-12","ADDRESS":"12 rue de la Paix","ZIP":"29200","CITY":"Brest","PHONE":"0612345678",
 "PARENT1EMAIL":"…","PARENT1PHONE":"…","PARENT2EMAIL":"…","PARENT2PHONE":"…","PRENOM":"Léa","NOM":"Martin"}
```

Impact confirmé :

- **Données de santé** (art. 9 RGPD) transmises à un sous-traitant marketing : handicap, allergies, PAI/PPS,
  structure médico-sociale, aménagements spécifiques, PSC1, dossier médical.
- **Adresse précise, téléphone, date de naissance** d'un mineur.
- Le contact **parent1** reçoit les données de santé du jeune **et les coordonnées de parent2** (et
  réciproquement) : divulgation entre représentants légaux, y compris en cas de séparation.

## Correction

Remplacement de la liste d'exclusion par une **liste explicite de champs** (`YOUNG_SYNC_FIELDS`,
`REFERENT_SYNC_FIELDS`, `PARENT_SYNC_FIELDS`) consommée par `buildAttributes()`. Un champ non listé n'est
jamais transmis : l'ajout d'un champ au schéma ne crée plus de fuite par défaut. `isSensitiveKey()` reste en
filet de sécurité sur les entrées de la liste.

Le contact parent ne reçoit plus que le contexte de campagne du jeune (cohorte, statut, phase, département,
région, académie, niveau, dates) plus prénom / nom du jeune — comportement conservé, les gabarits parents
s'appuient dessus.

Attributs désormais envoyés pour un jeune : `COHORT`, `COHORTID`, `ORIGINALCOHORT`, `SOURCE`, `STATUS`,
`ACCOUNTSTATUS`, `PHASE`, `STATUSPHASE1/2/3`, `PHASE2APPLICATIONSTATUS`, `PHASE2NUMBERHOURSDONE`,
`INSCRIPTIONSTEP`, `INSCRIPTIONSTEP2023`, `HASSTARTEDREINSCRIPTION`, `WITHDRAWNREASON`, `GRADE`, `SITUATION`,
`SCHOOLED`, `ACADEMY`, `DEPARTMENT`, `REGION`, `COUNTRY`, `QPV`, `ISREGIONRURAL`, `POPULATIONDENSITY`, dates
de cycle de vie, plus `PRENOM`, `NOM`, `TYPE`, `REGISTRED`.

## À valider avant déploiement

Les attributs Brevo ne sont consommés nulle part dans le dépôt : ils servent aux **segments et campagnes
configurés dans l'interface Brevo**. La liste ci-dessus est un choix raisonné côté sécurité, pas un relevé
des usages réels. À confronter avec l'équipe marketing : un segment qui s'appuyait sur un attribut retiré
cessera de fonctionner. Les attributs déjà présents chez Brevo ne sont pas supprimés par ce changement —
prévoir une purge côté Brevo des attributs de santé historiques.

## Points relevés au passage (hors périmètre)

- `attributes.REGISTRED = !!attributes.REGISTRED_AT` : la clé produite est `REGISTREDAT` (pas
  `REGISTRED_AT`), donc `REGISTRED` vaut toujours `false`. Bug préexistant, comportement conservé ici.
- Les deux constats fusionnés dans l'entrée H7 de l'audit sont des vulnérabilités distinctes, **toujours
  présentes** : repli de `JWT_SECRET` sur `dev-secret` (`api/src/config.ts:27`) et chiffrement S3 en
  AES-256-CTR sans authentification (`api/src/cryptoUtils.ts:4`).

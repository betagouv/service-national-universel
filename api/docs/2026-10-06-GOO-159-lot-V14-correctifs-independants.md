# Lot V14 (vague 3) — correctifs indépendants

Ticket Linear GOO-159. Chaque constat est corrigé par sa propre PR, un dossier à la fois.

## 1. Correctifs

| Constat | Route / fichier | PR | Correctif |
| --- | --- | --- | --- |
| PH13 | `POST /structure` | [#5475](https://github.com/betagouv/service-national-universel/pull/5475) | le drapeau `isMilitaryPreparation` n'est plus modifiable par un responsable ou un superviseur à la création d'une structure (seul `PUT /structure/:id` l'était déjà) |
| PM17 | uploads (dépôts de fichiers) | [#5466](https://github.com/betagouv/service-national-universel/pull/5466) | plafond de fichiers par dépôt et purge des fichiers temporaires jamais nettoyés |
| C1-4 / H22 | `PUT /correction-request/:id`, suppression de pièce | [#5467](https://github.com/betagouv/service-national-universel/pull/5467) | le contrôle du statut de la demande de correction précède désormais la suppression S3 de la pièce (CNI), plus de suppression sans contrôle |
| PM16 | attestations officielles (phase 1, phase 2, SNU) | [#5481](https://github.com/betagouv/service-national-universel/pull/5481) | une attestation n'est plus générée sans vérifier le statut réel du volontaire |
| FM1 | dossier PM (mobilité) | [#5485](https://github.com/betagouv/service-national-universel/pull/5485) | contrôle du statut source avant tout accès au dossier |
| M43 | `POST /young/signup_verify` | [#5486](https://github.com/betagouv/service-national-universel/pull/5486) | route retirée (aucun appelant front, dossier jeune complet exposé à tout porteur d'un `invitationToken`) |
| M26 | `POST`/`PUT /program` | [#5487](https://github.com/betagouv/service-national-universel/pull/5487) | cloisonnement croisé département/région : un référent départemental ou régional ne pose plus de territoire hors du sien |
| H5 | `GET /referent/youngFile/:youngId/:key/:fileName` | [#5488](https://github.com/betagouv/service-national-universel/pull/5488) | non-régression sur la clé `application` (le lot PH20/H65, #5460, fermait déjà ce constat en code ; tests ajoutés) |
| PM13 | `PUT /mission/:id` | *(cette PR)* | la revalidation d'une mission validée couvre maintenant aussi `hebergementPayant`, `format`, `period`, `subPeriod`, `domains`, `mainDomain`, `remote`, `country`, `location` — champs qu'un responsable ou un superviseur pouvait jusqu'ici reposer sans repasser la mission en modération |

## 2. Hors de ce lot

- **H87 (latent)** : rôles de centre verrouillés. Mentionné par le ticket, non traité dans ce lot — aucune PR, aucun correctif.
- **PM23** : chiffrement S3 (AES-CTR sans authentification). Reste à traiter séparément, hors périmètre de cette note (changement de format de chiffrement, migration dédiée).

## 3. PM13 — détail

Le lot P04 (GOO-59, #5415) avait déjà introduit `missionRequiresRevalidation` et
`MISSION_MODERATED_FIELDS` (`api/src/services/missionAccess.ts`) pour renvoyer en modération une
mission validée dont un responsable ou un superviseur change `name`, l'adresse, les dates, le
territoire ou `isMilitaryPreparation`/`hebergement`. La liste omettait d'autres champs publiés aux
volontaires sur la fiche mission : `hebergementPayant`, `format`, `period`, `subPeriod`, `domains`,
`mainDomain`, `remote`, `country`, `location` (coordonnées). Une structure pouvait donc les changer
sur une mission déjà validée sans nouvelle revalidation par le référent.

Choix : comparer les tableaux (`period`, `subPeriod`, `domains`) via une sérialisation triée plutôt
que `String(valeur)` (qui rend la même chaîne pour deux tableaux différents), et les coordonnées
(`location`, objet `{lat, lon}`) via une sérialisation de ses deux clés. Les autres champs ajoutés
sont des chaînes, déjà couvertes par la comparaison existante.

`sideDomain` (constat d'origine) n'a pas été ajouté : vérifié dans le code, il n'existe que côté
validateur (`api/src/utils/validator.ts`), pas dans le schéma Mongoose de la mission — Mongoose
l'ignore silencieusement à l'enregistrement (`strict` par défaut), donc rien n'est jamais persisté
sous ce nom.

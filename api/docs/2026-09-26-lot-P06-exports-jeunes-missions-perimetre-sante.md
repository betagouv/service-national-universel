# Lot P06 — apiv2 : exports jeunes et missions (périmètre, santé)

Audit de sécurité de la production du 25/09/2026, constats PH21, PH22 et PM39 (ticket Linear
GOO-61). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main` @ `09d22d756`.

PH23 (`GET /v2/referent`, cast `$in` Mongoose) est déjà réglé : la route a été supprimée par le lot
P01 (GOO-55, #5414).

## 1. Correctifs

| Constat | Route / fonction | Correctif |
| --- | --- | --- |
| PH21 | `POST /v2/mission/export`, `POST /v2/mission/candidatures/export` (`ExportMissionService.searchMissions`) | Ajout des branches `REFERENT_DEPARTMENT`/`REFERENT_REGION` : le filtre `department`/`region` du client est écrasé par le territoire du référent (403 si absent), comme `buildMissionContext` (GOO-45) |
| PM39 (missions) | même fonction, branche `SUPERVISOR` | Un `structureId` ne désignant plus aucune structure/réseau lève désormais une exception au lieu de poser `filters.structureId = []`, ignoré silencieusement par le builder Elasticsearch (export national) |
| PM39 (jeunes) | `POST /v2/jeune/export`, `POST /v2/inscription/export` (`ExporterJeunes.appliquerPerimetreTerritorial`) | Un périmètre serveur vide (région ou département manquant chez le référent) lève une exception au lieu de poser un filtre `[]` |
| PH22 | `POST /v2/jeune/export`, `POST /v2/inscription/export` (`ExporterJeunes.generateRapport`/`mapInscription`/`mapVolontaire`) | `omitYoungFields(jeune, getYoungFieldsHiddenFrom(auteur))` appliqué avant le mapping de chaque jeune : `RESPONSIBLE`/`SUPERVISOR` ne reçoivent plus handicap, PPS, PAI, structure médico-sociale, aménagement spécifique, allergies ni la validité de la pièce d'identité, quels que soient `format`/`fields` |
| PH22 (oracle) | `ExporterJeuneService.getAllowedFilters` | Les mêmes champs sont retirés de la liste blanche des filtres pour ces deux rôles, pour empêcher de déduire la donnée via un filtre (`handicap=true`) même colonne masquée |

`getYoungFieldsHiddenFrom`/`omitYoungFields` sont les fonctions déjà utilisées côté v1
(`serializer.js`/`es-serializer.js`) depuis GOO-11 (#5372) : même règle, un seul mécanisme.

## 2. Choix

- Masquage champ par champ (`omitYoungFields`), pas par bloc entier : les blocs `situation`/`birth`
  de `mapVolontaire` contiennent aussi des champs non sensibles (QPV, zone rurale, ville de
  naissance) que GOO-11 n'interdit pas à ces rôles ; seuls les champs listés par
  `getYoungFieldsHiddenFrom` disparaissent.
- `appliquerPerimetreTerritorial` refuse un périmètre vide avant même de regarder le filtre
  « scolarisés dans … » du client : un référent mal provisionné n'obtient jamais un export
  national, quelle que soit la requête envoyée.
- La branche `isResponsableDeCentre` d'`ExporterJeunes` n'est pas touchée : elle doit rester en
  place jusqu'au décommissionnement du rôle (lot P25/P26), sous peine de faire retomber un chef de
  centre sur un export sans aucun filtre.

## 3. Impact fonctionnel

Un compte territorial (référent départemental/régional, superviseur) mal provisionné — département,
région ou structure/réseau manquant ou invalide en base — voit son export échouer (403/erreur de
tâche) au lieu de recevoir un export national. Un responsable ou superviseur de structure ne reçoit
plus les colonnes de santé/handicap/PPS/PAI/médico-social ni la date de validité de la pièce
d'identité dans ses exports Excel ; les autres colonnes (identité, contact, scolarité, phase 2,
statut, représentants légaux) sont inchangées.

## 4. Après déploiement

- Recenser les comptes `REFERENT_DEPARTMENT`/`REFERENT_REGION`/`SUPERVISOR` sans département, région
  ou structure/réseau en base : leurs prochains exports jeunes/missions échoueront jusqu'à
  correction de leurs données.
- Interroger les tâches `JEUNE_EXPORT` et `MISSION_EXPORT(_CANDIDATURES)` passées dont l'auteur est
  référent départemental/régional ou superviseur, pour mesurer d'éventuels exports nationaux déjà
  effectués avant ce correctif.

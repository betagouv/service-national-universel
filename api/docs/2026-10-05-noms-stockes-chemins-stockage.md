# Lot : noms de pièces stockés bornés avant de composer un chemin de stockage

Date : 2026-10-05 · Constats PH20 et H65 (suite de `2026-10-05-referent-young-file-cle-bornee.md`, reprise après la
relecture du correctif) · Branche `fix/referent-young-file-cle-bornee`, base `origin/main` (`b46218e79`)

Déploiement : api seul. Aucun contrat de front modifié. Aucune migration.

## Ce qui est corrigé

### Invariant rétabli

Un nom de pièce relu en base (champ du dossier du volontaire, liste de pièces d'une candidature) n'est utilisé pour
composer un chemin d'objet que s'il désigne **un seul niveau** de l'arborescence. La règle est la même que pour les
valeurs venues de l'URL : la fonction partagée `isSafePathSegment` / `safePathSegment()`
(`src/utils/pathSegment.ts`) refuse la chaîne vide, les segments `.` et `..`, tout `/` et `\`, et tout caractère de
contrôle. Un nom comme `a..b.pdf`, avec espaces et accents, reste valide.

### Routes concernées

| Route | Avant | Maintenant |
| --- | --- | --- |
| `POST /referent/young/:id/refuse-military-preparation-files` | chaque nom stocké sous les quatre listes de pièces de préparation militaire était repris tel quel dans le chemin supprimé | un nom non sûr est ignoré (il n'est pas passé à la suppression) ; les noms légitimes sont supprimés comme avant |
| `GET /application/:id/file/:key/:name` | `name` : `Joi.string()` (puis contrôle d'appartenance à la liste de la candidature) | `name` : un seul niveau, vérifié avant la recherche de la candidature ; 400 sinon |

### Journalisation

Lorsqu'un nom stocké est ignoré, un avertissement est journalisé avec le nombre de noms ignorés, l'identifiant du
volontaire et la clé de la liste. La valeur du nom n'y figure pas.

## Comportements modifiés

Aucun pour un nom légitime : la suppression des pièces de préparation militaire et la lecture d'une pièce de
candidature produisent les mêmes chemins et les mêmes réponses. Le refus d'un dossier de préparation militaire
aboutit toujours (statut `REFUSED`), y compris lorsque tous les noms stockés sont ignorés.

## Tests

- `src/__tests__/referent-young-file-path.test.ts` : noms stockés non sûrs (remontée, sous-chemin, antislash, octet
  nul, retour à la ligne, `..`, `.`, chaîne vide) jamais passés à la suppression alors que les noms légitimes voisins
  le sont ; dossier tout de même refusé ; aucun nom dans le journal ; noms légitimes inchangés.
- `src/__tests__/lot-p02-candidatures.test.ts` (PM3) : lecture d'une pièce de candidature refusée (400) pour un nom
  stocké non sûr, sans lecture du stockage ; noms légitimes lus comme avant.
- Les cas de `referent-young-file-path.test.ts` qui utilisaient un chef de centre synthétique (rôle décommissionné,
  objet littéral) sont retirés ; les référents territoriaux y sont de vrais documents.

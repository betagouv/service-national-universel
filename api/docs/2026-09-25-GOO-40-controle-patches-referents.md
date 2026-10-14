# GOO-40 — contrôle des modifications de comptes référents antérieures à #5360 (GOO-5)

## Contexte

#5360 (GOO-5, mergée le 23/09/2026 à 12 h 33 UTC) borne les valeurs écrites par `PUT /referent/:id`
et par le rattachement à une structure : statut et e-mail réservés à l'admin, géographie limitée au
territoire de l'auteur, pas de changement de son propre sous-rôle. La faille est fermée pour
l'avenir ; ce contrôle dit si elle a servi avant.

## Outil

`api/src/scripts/auditReferentSelfUpdates.effect.ts`, **lecture seule**. Il parcourt
`referent_patches` jusqu'au merge de #5360 et remonte chaque écriture que le correctif aurait
refusée. Les règles sont dans `auditReferentSelfUpdates.helpers.ts` :

| Motif                             | Écriture                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `AUTO_STATUT`, `TIERS_STATUT`     | changement de `status` par un non-admin                                                |
| `AUTO_COURRIEL`, `TIERS_COURRIEL` | changement d'`email` par un non-admin (casse et espaces ignorés)                       |
| `AUTO_ROLE`, `TIERS_ROLE`         | changement de `role` par un non-admin (dont le rattachement d'un pair à une structure) |
| `AUTO_SOUS_ROLE`                  | changement de son propre `subRole`                                                     |
| `*_GEOGRAPHIE_HORS_TERRITOIRE`    | `region` ou `department` écrits hors du territoire de l'auteur                         |

Écarté : les admins (y compris en usurpation d'identité), les écritures sans auteur (crons,
invitation) et les champs non surveillés.

Un cas remonté n'est pas une preuve d'abus : un référent a pu corriger de bonne foi la fiche d'un
pair. Relire en priorité les auto-modifications (`"auto": true`), puis les comptes encore actifs.

## Lancement

```bash
cd api
MONGO_URL=<base de production> REPORT_FILE=./audit-referent-self-updates.jsonl npx tsx src/scripts/auditReferentSelfUpdates.effect.ts
```

- Sortie standard : compteurs et motifs, sans adresse e-mail.
- `REPORT_FILE` (JSONL, 0600) : un cas par ligne, valeurs avant/après et auteur (e-mail compris).
  Ne pas le partager ni le commiter.
- Code de sortie 2 s'il reste des cas à relire.
- `SINCE` / `UNTIL` (ISO) restreignent la fenêtre.

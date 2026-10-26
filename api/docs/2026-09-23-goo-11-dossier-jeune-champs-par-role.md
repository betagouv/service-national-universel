# GOO-11 — dossier jeune : notes internes, santé et pièces d'identité selon le rôle (FH6, FH10)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`68e7252c4`)

Les deux constats ont été relus sur le code courant avant correction : confirmés. Après H67 (#5342),
le périmètre de `GET /referent/young/:id` était corrigé mais pas les champs : `serializeYoung` renvoyait
le dossier complet à tout appelant autorisé. Seule l'interface masquait les notes internes
(`canViewNotes`, `YoungHeader.jsx`) et les situations particulières (contrôle de rôle en ligne,
`volontaires/panel.jsx`). Les réponses Elasticsearch des jeunes (recherche, exports, export des
candidatures) avaient le même défaut.

## Décision métier

Une structure d'accueil (RESPONSIBLE, SUPERVISOR) instruit une candidature à une mission : elle n'a
besoin ni des notes internes des référents, ni des données de santé, ni des pièces d'identité.
C'est ce que l'interface appliquait déjà ; l'API l'applique désormais. Un aménagement nécessaire à la
mission passe par le référent du volontaire.

| Rôle | Notes internes | Santé / handicap / suivi médico-social | Pièces d'identité (`files.cniFiles`, métadonnées CNI) |
|---|---|---|---|
| ADMIN, REFERENT_DEPARTMENT, REFERENT_REGION, REFERENT_CLASSE, ADMINISTRATEUR_CLE | oui | oui | oui |
| RESPONSIBLE, SUPERVISOR | non | non | non |
| VISITOR et autres rôles | non | oui | oui |
| Volontaire (son propre dossier) | non | oui | oui |
| Appelant inconnu | non | non | non |

## Ce qui change

| Où | Avant | Après |
|---|---|---|
| `snu-lib` `roles.ts` | `canViewNotes` seul, utilisé par l'interface | `getYoungFieldsHiddenFrom(actor)` : liste des champs à retirer ; `YOUNG_HEALTH_FIELDS`, `YOUNG_IDENTITY_FILE_FIELDS` ; `canViewYoungHealthData`, `canViewYoungIdentityFiles` ; `omitYoungFields` gère les chemins pointés sans muter les objets imbriqués |
| `api` `serializeYoung` | ne retirait que les secrets (et `qpv` pour le volontaire) | retire aussi les champs de `getYoungFieldsHiddenFrom(user)` |
| `api` `serializeYoungs` (ES) | ne retirait que les secrets | idem, sur chaque `_source` (résultats, agrégations `top_hits`, exports aplatis) |
| Appelants sans utilisateur | 15 appels `serializeYoung(young)`, dont deux `youngs.map(serializeYoung)` qui passaient l'index du tableau comme utilisateur | tous passent `req.user` ; seul reste `classeExportService` (projection `_id`, `status`, `classeId`) |
| ES : `young.ts`, `cle/young.js`, `lignebus.js`, `application.ts` (`populateApplications`) | `serializeYoungs(response)` | `serializeYoungs(response, req.user)` |
| `controllers/young/note.ts` | filtrage des notes local (`serializeYoungWithNotes`) | supprimé, porté par `serializeYoung` |
| admin `volontaires/view/notes` | `young.notes.map` plantait si `notes` était absent | liste vide affichée |

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `packages/lib` — `jest src/roles.spec.ts` | 12/12 |
| `api` — `young-restricted-fields.test.ts` (nouveau) + `referent-young-security.test.ts` | 28/28 |
| `api` — suite complète en série (transpile-only, cf. ci-dessous) | 6 échecs préexistants hors périmètre : comparaisons `CoreMongooseArray` / `Array` et `location` sur des lectures en base (`referent-security`, `young`, `young-statuts-auto-servis`) |
| `api`, `packages/lib`, `admin` — eslint des fichiers modifiés | 0 erreur |

En worktree, ts-jest bute sur le double typage mongodb (`models/cle/etablissement.ts:32`) : les suites
ont été lancées avec `isolatedModules`. La CI fait foi.

## Points d'attention

- Le filtrage se fait à la sérialisation, pas dans la requête ES (`_source.excludes`) : les champs
  quittent Elasticsearch puis sont retirés par l'API avant réponse.
- `hasNotes` (booléen) reste visible ; seul le contenu des notes est retiré.
- Les pièces de préparation militaire (`files.militaryPreparationFiles*`) ne sont pas concernées :
  elles relèvent du parcours dédié.

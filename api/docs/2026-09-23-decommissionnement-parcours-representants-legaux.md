# Décommissionnement du parcours des représentants légaux

Date : 2026-09-23 · Branche `feat/decommission-parcours-representants-legaux`, base `origin/main` (`f1ff4a5fe`)

Il n'y a plus d'inscriptions et le dispositif est en phase 2. Le consentement parental, le droit à
l'image et l'acceptation du règlement intérieur par les parents ne sont plus proposés. Ce parcours
restait pourtant en ligne : des routes publiques authentifiées par un simple jeton transmis dans l'URL
des emails, et des routes qui envoyaient ce jeton aux parents. FranceConnect, qui en faisait partie, a
été retiré dans #5355.

Ligne de partage, reprise du décommissionnement CLE : **supprimer ce qui écrit ou envoie, conserver
la consultation**. Les consentements déjà donnés restent en base et s'affichent dans l'admin.

## Supprimé

### API

| Route | Rôle |
|---|---|
| `GET /representants-legaux/young` | lecture du dossier par jeton parent |
| `POST /representants-legaux/data-verification` | vérification des données par le parent |
| `POST /representants-legaux/accept-ri` | acceptation du RI par le parent |
| `POST /representants-legaux/consent` | consentement à la participation |
| `POST /representants-legaux/consent-image-rights` | droit à l'image |
| `POST /representants-legaux/cni-invalide` | attestation sur l'honneur (pièce d'identité périmée) |
| `PUT /young/accept-ri` | réacceptation du RI par le jeune, puis email au parent 1 |
| `PUT /young/inscription2023/relance` | relance du parent par le jeune |
| `POST /correction-request/:youngId/remind-cni` | relance du parent (pièce d'identité périmée) |
| `PUT /young-edition/:id/parent-allow-snu` | refus du parent 2 saisi par un référent |
| `GET /young-edition/:id/remider/:idParent` | relance de consentement |
| `PUT /young-edition/:id/parent-image-rights-reset` | réinitialisation du droit à l'image, puis email |
| `PUT /young-edition/:id/parent-allow-snu-reset` | annulation d'un refus, puis email |
| `PUT /young-edition/:id/reminder-parent-image-rights` | relance du droit à l'image |

Supprimés également :

- `young/parentConsentToken.ts` et l'émission des jetons, dans `POST /young/invite`, `PUT /young/account/parents` et `PUT /young/inscription2023/representants/:type` ;
- les emails de consentement et de pièce d'identité périmée envoyés au parent par `PUT /young/inscription2023/confirm`. L'email au jeune est conservé.

### App

Tout `scenes/representants-legaux/`, `RepresentantsLegauxContextProvider`, la modale de
réacceptation du RI (`ModalRI`, `shouldReAcceptRI`), et le bouton « Renvoyer l'email » de l'étape
d'attente du consentement. `CDN_BASE_URL`, qui servait aussi en phase 1, passe dans `config.ts`.

### Admin

- **Section Consentements** : en lecture seule. Disparaissent « Copier le lien du formulaire », « Relancer », « Modifier » (droit à l'image), « Annuler le refus de consentement » et « Déclarer un refus ». Le téléchargement de l'attestation de droit à l'image reste.
- **Section Identité** : le bouton « Relancer » de l'attestation sur l'honneur disparaît.

## Conservé

- **Champs du volontaire** : `parentXAllowSNU`, `parentXAllowImageRights`, `parentXValidationDate`, `parentStatementOfHonorInvalidId`, etc. Ils servent à l'affichage, aux exports, à l'anonymisation et au cron `deleteLegalRepresentatives`.
- **`PUT /young-edition/ref-allow-snu`** : consentement saisi par un référent CLE. Il relève du décommissionnement CLE.
- **Tunnel d'inscription côté jeune** (`inscription2023`) : lot séparé. Ses textes mentionnent encore l'email envoyé au représentant légal.
- **Constantes `SENDINBLUE_TEMPLATES.parent.*`** : plus aucun envoi de consentement, mais elles restent dans `snu-lib`.

## Migration

`20260923120000-decommissionnement-representants-legaux-jetons.js` efface
(`$unset`) `parent1/2Inscription2023Token` et leurs dates d'expiration sur tous les volontaires. Une
fois les routes supprimées, ces jetons n'ouvrent plus rien, mais ce sont des secrets en clair.
L'écriture passe par le driver, sans hook ni patch d'historique. La migration est irréversible par
conception.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `representants-legaux-routes-supprimees.test.ts` sur le code d'avant | 14 échecs (routes encore montées) |
| même test après, plus `france-connect-routes-supprimees`, `young-edition(-security)`, `young-inscription`, `correction-request-security`, `young`, `young-security`, `crons/*` | 11 suites, 177 réussis, 3 ignorés (préexistants) |
| `tsc` api (`tsconfig.check.json`), app et admin (`tsconfig.ci.json`) | 0 erreur, hors `TS6307` préexistantes côté api |
| `vite build` app | OK |
| `eslint` sur les fichiers modifiés (api, app, admin) | 0 erreur |

Tests retirés : `representants-legaux-security.test.ts` (H34, H40, M27, M54 : routes supprimées)
et les cas des routes supprimées dans `young-edition-security`, `young-inscription` et
`correction-request-security`.

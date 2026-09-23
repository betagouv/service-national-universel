# Lot H1 — décommissionnement du tunnel d'inscription et de réinscription (M51, M52, M53, M55, M58, M100)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `f2909a011`
(branche `feat/retire-tunnel-inscription-488153`).

## 1. Constat

Les inscriptions sont fermées : `POST /young/signup` répond 403 depuis #5348, `/preinscription`
renvoie vers snu.gouv.fr/inscriptions-cloturees et le dispositif est en phase 2. Les routes du
tunnel d'inscription (`/young/inscription2023/*`) et de réinscription (`/young/reinscription/*`)
restaient pourtant servies à tout jeune connecté, quel que soit son statut. La seule garde,
`canUpdateYoungStatus`, n'interdit que les passages vers VALIDATED ou DONE.

Le correctif retenu est la **suppression**, pas l'ajout de gardes de statut.

| Id | Route(s) | Défaut | Correctif |
| --- | --- | --- | --- |
| M51 | `PUT /young/inscription2023/eligibilite`, `/profil` | réécriture de l'identité vérifiée (date de naissance, nom, scolarité) après validation | routeur démonté |
| M52 | `PUT /young/inscription2023/coordinates/:type` | changement libre de département / région, sans les gardes de `PUT /young/account/address` | routeur démonté |
| M53 | `PUT /young/inscription2023/changeCohort` | second chemin de changement de séjour, sans `youngCanChangeSession` ni remise à zéro de l'affectation | routeur démonté |
| M55 | `/eligibilite`, `/profil`, `*/correction` | remise en WAITING_VALIDATION d'un dossier refusé ou validé ; e-mail changé sans vérification | routeur démonté |
| M58 | `PUT /young/reinscription` | réinscription ouverte aux exclus (garde `hasAccessToReinscription` commentée), effacement du motif d'exclusion | routeur démonté |
| M100 | toutes les fenêtres calculées avec `x-user-timezone` | décalage non borné : « maintenant » déplaçable de plusieurs jours | décalage borné à ±840 min |

## 2. Ce qui est retiré

### api

- `controllers/young/index.ts` : montages `/reinscription` (3 routes) et `/inscription2023`
  (11 routes) ; fichiers `reinscription.js` et `inscription2023.js`.
- `GET /cohort-session/isReInscriptionOpen` et `GET /cohort-group/open` : leurs seuls appelants
  étaient la page d'accueil et le menu « changer de séjour » de l'app, qui redirigeaient vers la
  réinscription. Avec eux : `isReInscriptionOpen`, `isCohortReinscriptionOpen` et
  `getFilteredSessionsForReinscription` (`cohort/cohortService.ts`), et
  `cohortGroup/cohortGroupService.ts` (`getCohortGroupsForYoung`, sans autre appelant).
- `auth.ts`, `validateEmail` (`POST /young/email-validation`) : l'e-mail « inscription commencée »
  envoyé après validation de l'adresse renvoyait vers `/inscription2023`. Il n'est plus envoyé.
- `young/email/youngEmailService.ts` : le CTA spécifique au modèle `INSCRIPTION_STARTED`
  (`/inscription/coordonnees`) ; ce modèle retombe sur l'URL de l'app par défaut.
- `__tests__/young-inscription.test.ts` (ne testait que `/young/inscription2023/*`), et les cas de
  `cohort-group.test.ts` et `cohort-session.test.ts` portant sur les deux routes retirées.

Les CTA vers `/inscription2023` de `signupVolontaire` et `signupCLE` (`auth.ts`) sont **laissés en
place** : ce code n'est plus appelé depuis que `POST /young/signup` répond 403 (#5348), qui l'a
conservé délibérément pour une réouverture éventuelle des inscriptions. À corriger à ce moment-là.

### app

- `scenes/inscription2023/`, `scenes/reinscription/` et `scenes/preinscription/` (cette dernière
  n'était plus routée : `/preinscription` redirige vers snu.gouv.fr).
- `app.jsx` : les imports, le `Redirect` `/inscription2023 → /inscription` et les deux
  `SecureRoute` `/inscription` et `/reinscription`.
- `Espace.jsx` : la redirection forcée vers `/inscription` des jeunes IN_PROGRESS, NOT_AUTORISED ou
  REINSCRIPTION. Sans la route, elle aurait bouclé sur `/` (le `SecureRoute` `/` capte
  `/inscription` et renvoie vers Espace).
- `scenes/home/index.tsx` : `WaitingReinscription` et la redirection vers `/reinscription`. Un jeune
  éligible à la réinscription voit désormais son espace (phase 1 en cours ou non faite).
- `scenes/home/components/StatusNotice.tsx` : le bouton « Consulter mon dossier d'inscription »
  (`PUT /young/inscription2023/goToInscriptionAgain`).
- `scenes/changeSejour/scenes/ChangeSejourMenu.tsx` : la section « S'inscrire pour {année} » et son
  lien `/reinscription` ; `lib/useCohortGroups.ts`, `lib/useReinscription.ts`,
  `services/reinscription.service.ts` et `fetchOpenCohortGroups`.
- `scenes/cle/OnBoarding.tsx` : un élève CLE déjà connecté est renvoyé vers `/` au lieu de
  `/inscription`.
- `scenes/home/components/CorrectionRequests.tsx`, déjà importé nulle part, qui ne liait qu'aux
  pages de correction `/inscription/correction/*`.
- `utils/navigation.js` : ne garde que `shouldForceRedirectToEmailValidation` ; `utils/index.js` :
  `displaySignupToast` (« reprenez votre inscription là où vous l'avez laissée ») ;
  `hooks/usePermissions.ts` : `canModifyInscription` et `hasAccessToReinscription`.
- Les composants, contextes et images qui n'étaient importés que par ces scènes (formulaires DSFR
  d'adresse, de téléphone, de date et d'import de fichier, `Stepper`, pictogrammes des pièces
  d'identité, `PreInscriptionContextProvider`, `ReinscriptionContextProvider`,
  `services/file.service.js`…). Liste obtenue en comparant les fichiers importés nulle part avant et
  après la suppression, jusqu'à stabilité.

### snu-lib

- `hasAccessToReinscription` (`sessions.ts`) et `isYoungInReinscription` (`common.ts`) : plus aucun
  appelant.
- Types de route `GetIsReincriptionOpen` et `CohortGroupRoutes.GetOpen`.

## 3. Composants relocalisés

Des fichiers des scènes supprimées étaient importés ailleurs ; ils sont déplacés, pas dupliqués.

| Avant | Après | Importé par |
| --- | --- | --- |
| `scenes/inscription2023/components/ErrorMessageOld.jsx` | `components/forms/ErrorMessageOld.jsx` | `dndFileInput`, `dndFileInputV2`, `phase3/valider/WaitingRealisation` |
| `capitalizeFirstLetter` (`scenes/inscription2023/steps/stepConfirm.jsx`) | `utils/index.js` | 3 écrans de `changeSejour` |
| `scenes/inscription2023/assets/error.png` | `assets/error.png` | `account/AccountAlreadyExists` |
| `scenes/preinscription/components/EngagementCard.jsx` | `components/engagement/EngagementCard.jsx` | `all-engagements`, `phase3/home/waitingRealisation` |
| `scenes/preinscription/components/EngagementPrograms.jsx` | `components/engagement/EngagementPrograms.jsx` | `home/EnAttente`, `home/waitingAffectation`, `noneligible` |
| `scenes/preinscription/components/Modals.ts` | `components/modals/dsfrModals.ts` | `cle/OnBoarding`, `account/…/DidNotReceiveActivationReasons` |
| `scenes/preinscription/components/AlreadyHaveAnAccountModal.tsx` | `scenes/cle/components/AlreadyHaveAnAccountModal.tsx` | `cle/OnBoarding` |

## 4. Ce qui est conservé

- `GET` et `PUT /young/change-cohort` : le parcours « changer de séjour » reste actif et porte ses
  propres gardes (`youngCanChangeSession`, remise à zéro de l'affectation, liste complémentaire).
- `youngCanChangeSession` (snu-lib) : toujours appelé par `young/index.ts` et par l'écran
  `phase1/scenes/affected` de l'app.
- Le contrôleur `api/src/preinscription/` : hors périmètre (M64 relève du lot T2). **Ses deux
  routes, `POST /preinscription/eligibilite` et `POST /preinscription/create-lead`, n'ont plus
  aucun appelant** : elles n'étaient appelées que par `scenes/preinscription/` et par la
  réinscription, qui en réutilisait les étapes. Le lot T2 peut les supprimer au lieu de les
  corriger.
- Les méthodes `getIsReInscriptionOpen` / le virtuel `isReInscriptionOpen` du modèle Cohort :
  encore lus par `utils/cohort.ts` et affichés dans l'admin.

## 5. M100 — bornage de `x-user-timezone`

- `middlewares/validateCustomHeader.js` : `Joi.number().min(-840).max(840)` ; une valeur hors borne,
  non numérique ou absente devient 0, comme l'absence d'en-tête auparavant.
- `packages/lib/src/utils/date.ts` : `getDateTimeByTimeZoneOffset` passe par `clampTimeZoneOffset`
  (nouvel export, avec `MAX_TIMEZONE_OFFSET_MINUTES`) : « maintenant » ne peut plus être déplacé de
  plus de 14 heures, même si un appelant contourne le middleware.

Le calcul reste fondé sur un en-tête client : la fenêtre peut encore être étirée de quelques heures
à ses bornes. Le correctif de fond (comparer en UTC côté serveur) n'est pas fait ici.

## 6. Vérification

| Suite | Cas | Avant | Après |
| --- | --- | --- | --- |
| `__tests__/tunnel-inscription-routes-supprimees.test.ts` | 11 routes `/young/inscription2023/*`, 3 routes `/young/reinscription*`, `isReInscriptionOpen`, `cohort-group/open`, jeune authentifié (`createYoungHelper`) | **rouge** (routes montées) | 404 sans corps applicatif |
| idem | `PUT /young/inscription2023/documents/{next,correction}` | **rouge** | 400 `INVALID_PARAMS` : le chemin tombe sur `/young/:id/documents` avec `id = "inscription2023"` et le contrôle de périmètre le rejette avant tout gestionnaire |
| `__tests__/validate-custom-header.test.ts` | décalages réels conservés ; hors borne, non numériques ou absents → 0 | **rouge** (43200 conservé) | vert |
| `packages/lib/src/utils/date.spec.ts` | `clampTimeZoneOffset`, `getDateTimeByTimeZoneOffset` sous horloge figée | **rouge** | vert |

`npm run build -w app`, `tsc --noEmit` (app, api, snu-lib) et `eslint` sur les fichiers modifiés
passent ; `git grep -n "inscription2023\|/reinscription" app/src` ne renvoie plus rien.

## 7. Suites

- **Jeunes restés dans le tunnel** : un jeune IN_PROGRESS, REINSCRIPTION ou WAITING_CORRECTION ne
  peut plus compléter ni corriger son dossier depuis l'app. Avant déploiement, compter en prod les
  dossiers `status ∈ {IN_PROGRESS, REINSCRIPTION, WAITING_CORRECTION}` des cohortes encore
  ouvertes. L'admin peut toujours poser une demande de correction (`ModalCorrection`), qui envoie au
  jeune un e-mail sans suite possible : à retirer dans un lot admin.
- `app/package.json` : `browser-image-resizer` et `heic2any` ne sont plus importés (ils ne servaient
  qu'à `services/file.service.js`). Dépendances à retirer dans un changement séparé du lockfile.
- `validateEmail` et `POST /young/signup/email` (changement d'adresse pendant l'inscription) n'ont
  plus d'appelant dans l'app ; ils sont conservés car `POST /young/email-validation` porte le limiteur
  de tentatives testé par `auth-anti-abus.test.ts`.

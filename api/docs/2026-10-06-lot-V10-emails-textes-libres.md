# Lot V10 : balisage retiré des textes saisis recopiés dans les emails officiels

Date : 2026-10-06 · Constats PM2, PM4, PM22 (résiduels), B-4 · Ticket GOO-155 · Branche `nuit/goo-155`, base `origin/main` (`70316e37d`)

Déploiement : api seul. Aucun contrat de front modifié. Aucune migration.

## Ce qui est corrigé

Le lot précédent (#5452) avait assaini cinq points d'envoi. Leurs frères, qui recopient les mêmes champs saisis par une
structure, un volontaire ou un référent (nom de mission, nom de structure, nom de centre, message de statut, domaines,
prénoms et noms), transmettaient la valeur brute au fournisseur d'emails. Ils passent maintenant par le helper partagé
`sanitizeEmailParams(params, keys)` (`src/email/emailInput.ts`), qui applique `sanitizeEmailText` aux clés listées
(chaîne ou tableau de chaînes ; valeur absente, nulle ou vide inchangée).

### Envois assainis

| Envoi | Champs |
| --- | --- |
| `crons/missionOutdated.js` : `MISSION_ARCHIVED_AUTO`, `MISSION_ARCHIVED`, `MISSION_ARCHIVED_1_WEEK_NOTICE` | nom de mission, message de statut |
| `application/applicationService.ts` `getEmailParamsForStatus` (route en lot `change-status`) | nom de mission, prénom et nom du volontaire |
| `crons/applicationWaitingAcceptationOutdated.ts` (relances J+7 et J+13) | nom de mission, nom de structure |
| `crons/applicationPending.js`, `crons/contratRelance.js` | nom de mission, prénom et nom du volontaire |
| `crons/noticePushMission.js` | domaines (après traduction) |
| `young/youngSendDocumentEmailService.ts`, `controllers/contract.ts` (envoi de contrat, contrat validé) | nom de mission, noms |
| `referent/referentController.ts` : invitation initiale et renvoi (`signup_retry`, `renew-invitation`) | nom du centre, de la structure, de la région, du destinataire |
| `controllers/mission.ts` (création, mise à jour), `crons/missionsJVA/JVAService.ts` | nom de mission |
| `utils/index.ts` clôture de candidature (phase 2 validée) | nom de mission, prénom et nom |
| `controllers/young/index.ts` validation de mission de phase 3 | noms (balisage seulement) |

### Sites laissés volontairement

- Gabarits d'emails du volontaire (`young/email/*`) : déjà assainis au contrôleur ; liste blanche de gabarits = décision à part.
- `PUT /young/account/parents`, renommage de structure sans modération, changement d'email d'un volontaire par un
  référent, garde « tuteur ≠ soi-même » de la phase 3 : hors périmètre du lot.
- Écritures en base de `application.missionName` (`applicationController.ts`, `mission.ts`) et import `JVAService.ts` : pas des envois.
- Même type de champ (prénom et nom du volontaire, nom de centre, nom de classe ou d'établissement), non touché par ce lot
  et à traiter dans un lot suivant : `applicationController.ts` (route notify), `applicationNotificationService.ts`,
  `utils/index.ts` (changement de département), `controllers/session-phase1.ts` (rappel de session, nom du centre),
  `emails/cle/*` et `services/cle/*` (noms de classe et d'établissement), `young/youngService.ts` (désistement),
  `young/youngSendDocumentEmailService.ts` (prénom dans l'objet des attestations), `planDeTransport/ligneDeBus` (identifiant de ligne),
  `emails/young/changeCohortEmail.js` (aucun émetteur trouvé), script ponctuel `scripts/invalidateExposedTokens.effect.ts`.
- `JVAService.cancelOldMissions` (MISSION_CANCEL) est assaini mais son appel est commenté dans `crons/missionsJVA/JeVeuxAiderDaily.ts`.
- Aucun site du lot ne recopie un lien saisi par un tiers (les liens sont construits par le serveur) : `isTrustedEmailLink` n'est pas utilisé.

### Limites connues

`sanitizeEmailText` retire le balisage mais garde le texte brut : une adresse en clair dans un champ saisi reste
transmise telle quelle. Il conserve aussi les balises de mise en forme `<b>`, `<br>` et `<li>` (comportement de `sanitizeAll`).
Non modifié ici.

## Comportements modifiés

Aucun code HTTP, forme de réponse ni limite. Seul le contenu des emails change : le balisage éventuel des champs saisis
est retiré ; une valeur normale est transmise à l'identique.

## Notes techniques

`utils/index.ts` définit un `sanitizeEmailText` local (même contrat, via `sanitizeAll`) : importer `email/emailInput`
depuis ce module crée un cycle d'import qui retire `sanitizeAll` des suites utilisant `jest.requireActual("../utils")`.

## Tests

`src/__tests__/email-textes-libres-v10*.test.ts` (4 fichiers, vraies routes et handlers de cron avec Mongo, fournisseur
mocké), `src/__tests__/crons/missionsJVA/JVAService.emails.test.ts`, `email-input.test.ts` (helper),
`crons/noticePushMission.test.ts` (domaines). Chaque envoi a un test « valeur balisée » et un test « valeur normale ».

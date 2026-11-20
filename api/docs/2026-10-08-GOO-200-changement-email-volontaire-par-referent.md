# Lot : changement d'email d'un volontaire par un référent confirmé à la nouvelle adresse (M73, GOO-200)

Périmètre : `api/src/young/edition/youngEditionController.ts` (`PUT /young-edition/:id/identite`), `api/src/auth.ts` (`validateEmailUpdate`, `requestEmailUpdate`, `requestNewEmailValidationToken`), `packages/lib/src/mongoSchema/young.ts`.

## 1. Corrigé

La nouvelle adresse saisie par un référent sur `PUT /young-edition/:id/identite` n'écrit plus `email` directement : elle est posée en `newEmail`, accompagnée d'un code de validation envoyé à la nouvelle adresse (même gabarit que le libre-service, `PROFILE_EMAIL_VALIDATION`). L'adresse réelle du volontaire ne change qu'à la validation du code, par le parcours existant (`POST /young/email-validation/new-email`), qui coupe alors les accès en cours et avertit l'ancienne adresse. Une saisie qui n'a pas la forme d'un email est refusée (400).

Un champ `newEmailRequestedByReferent` (Young) distingue l'origine de la demande en attente, pour que l'unique parcours de validation applique la révocation et l'avertissement seulement quand la demande vient d'un référent — le libre-service (mot de passe déjà vérifié) n'est pas affecté.

Deux correctifs supplémentaires, demandés par la relecture avant l'ouverture de la PR :

* Une session empruntée par un référent via `POST /referent/signin_as/young/:id` ne peut plus valider elle-même le code (`POST /young/email-validation/new-email`) ni en redemander un (`GET /young/email-validation/token`) à la place du volontaire : les deux routes refusent désormais une session avec `impersonateId` (403).
* Une demande en libre-service (`POST /young/email`) remet `newEmailRequestedByReferent` à `false` : sans cela, un volontaire qui redemandait lui-même le changement après une demande d'un référent restée en attente se voyait quand même déconnecté et son ancienne adresse avertie à la validation, alors qu'il avait lui-même prouvé son identité par mot de passe.
* `PUT /young-edition/:id/identite` refuse une adresse déjà utilisée par un autre compte (400, même code qu'avant) avant de poser la demande, plutôt que de laisser le code partir à l'adresse d'un tiers et de renvoyer un 409 tardif au volontaire à la validation.

## 2. Changement visible, accepté par le ticket

Après `PUT .../identite` avec un nouvel email, `young.email` ne change plus immédiatement : le toast générique de succès de l'écran admin (`SectionIdentite.tsx`) reste correct mais ne reflète plus un changement effectif. Aucun message n'indique au référent qu'une confirmation est en attente côté volontaire — signalé, hors périmètre api de ce ticket.

Le volontaire qui valide un changement initié par un référent est déconnecté juste après (la révocation des accès coupe sa session en cours, comme le demande le ticket) et doit se reconnecter avec la nouvelle adresse.

## 3. Non-régression

* `api/src/__tests__/email-sending-security.test.ts`, describe "M73/GOO-200" : mise en attente sans changement immédiat, pas de notification si l'adresse est inchangée, refus d'une adresse qui n'a pas la forme d'un email, bascule + révocation + avertissement seulement à la validation, refus d'une session empruntée (validation et nouvelle demande de code), refus d'une adresse déjà utilisée.
* `api/src/__tests__/young-email-update.test.ts` : le parcours libre-service (GOO-170) continue de fonctionner à l'identique (pas de révocation, pas d'avertissement), y compris après une demande référent restée en attente.
* `api/src/__tests__/young-edition-security.test.ts` : contrôle d'accès existant sur `PUT /young-edition/:id/identite` rejoué sans modification.

## 4. Hors périmètre

Aucune modification front : l'écran de validation du code côté volontaire (`ActivationCodeModalContent.tsx`) est réutilisé tel quel, conformément à la demande du ticket.

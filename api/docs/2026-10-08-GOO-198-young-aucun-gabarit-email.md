# Lot V10a : un volontaire ne peut plus déclencher aucun gabarit d'email officiel

Date : 2026-10-08 · Décision 4a de Philippe du 06/10, révisée le 08/10 · Ticket GOO-198 · Branche `nuit/goo-198`, base `origin/main`

Déploiement : api et app. Aucune migration.

## Ce qui est corrigé

Sur `POST /young/:id/email/:template` (`api/src/young/email/youngEmailController.ts`), quand l'acteur
est un volontaire (`young`), tout gabarit est désormais refusé : 403 `OPERATION_NOT_ALLOWED`, aucun
envoi. L'exception qui subsistait pour `SENDINBLUE_TEMPLATES.young.LINK` (envoi de la fiche sanitaire
depuis `MedicalFileModal`) est retirée : la phase 1 n'existe plus, donc plus de fiche sanitaire à
transmettre. Les référents gardent leur accès actuel (contrôle de périmètre `canEditYoungInScope`
inchangé).

Le refus intervient après la validation du gabarit (400 si le gabarit n'existe pas, inchangé) et avant
la vérification des liens fournis (`isTrustedEmailLink`) : un volontaire est donc désormais refusé même
s'il fournit un lien de confiance, ce qui change le code de certaines tentatives malveillantes déjà
bloquées (ex. lien vers un autre bucket Cellar : 400 avant, 403 maintenant — toujours bloqué, code
différent).

## Changement visible côté app (décision validée par ce ticket)

`app/src/scenes/phase1/components/MedicalFileModal.tsx` (le seul appelant app de cette route) est
atteignable : `app/src/scenes/phase1/waitingAffectation.tsx:11,47` monte `Files.jsx`
(`DocumentsPhase1`), rendu par défaut dans `scenes/phase1/index.tsx:22` (statut `WAITING_AFFECTATION`,
valeur par défaut du schéma) pour un volontaire dont le statut global n'est pas `VALIDATED` (ex.
`IN_PROGRESS`, `REINSCRIPTION`, `NOT_AUTORISED`). Pour ces volontaires, le bouton « Recevoir sur ma
boîte mail » de la modale appelait `POST /young/:id/email/young.LINK`, désormais toujours refusé (403).
Le bouton (et la confirmation d'envoi associée) est donc retiré de
`MedicalFileModal.tsx` dans un commit séparé : la modale garde le lien de téléchargement direct de la
fiche sanitaire et les instructions de remise en mains propres, mais ne propose plus l'envoi par email
qui échouerait systématiquement.

## Non concerné

Les appels référents depuis l'admin (`ModalCorrection.jsx`, `ModalRefused.jsx`, `selectStatus.jsx`,
`phase0/utils/service.ts`, `phase0/view.tsx`, `phase2MilitaryPreparationV2.jsx`,
`services/applicationService.ts`) : acteur référent, non touché. `PUT /young/account/parents` et le
reste du lot V10 (GOO-200 et suivants) : hors périmètre.

## Comportements modifiés

- 403 au lieu de 200 pour un volontaire sur n'importe quel gabarit de cette route, y compris
  `young.LINK`.
- 403 au lieu de 400 pour un volontaire dont la tentative sur `young.LINK` aurait aussi été refusée par
  la vérification de lien (toujours bloquée, code différent).
- Aucun changement pour les référents.

## Tests

`src/__tests__/young.test.ts` describe `POST /young/:id/email/:template` (volontaire refusé, référent
inchangé) ; `src/__tests__/email-sending-security.test.ts` describe `PM24/PM37` (lien Cellar) et
`GOO-198` (gabarit quelconque, référent inchangé, limiteur de débit qui continue de compter les
tentatives refusées). Non-régression citée : `young-edition-security.test.ts` (périmètre référent sur
cette route, inchangé), `email-sending-security.test.ts` « accepte un lien vers un domaine du service »
et « n'applique pas ce quota aux référents » (référent, inchangé).

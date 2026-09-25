# GOO-13 — révocation des comptes support des référents déchus

Audit des fronts du 2026-09-23, dernier point ouvert de GOO-13 (FH11, suite de #5378). Vérifié et
corrigé le 2026-09-24 sur `origin/main` @ `84b8e151b`.

## 1. Constat

Un compte agent snupport de rôle `REFERENT_DEPARTMENT`/`REFERENT_REGION` est créé par la synchro nocturne
`syncReferentSupport` (POST `/v0/referent`). Il n'était supprimé qu'à la **suppression** du référent
(DELETE `/v0/referent`, appelé depuis DELETE `/referent/:id`). Un référent qui changeait de rôle ou
passait en statut `INACTIVE` gardait donc son compte support : tickets de son ancien département, avec
leurs données personnelles.

- **SSO** : GET `/SNUpport/signin` était ouvert à tout référent authentifié. Un ancien référent
  départemental devenu `ADMIN`, `RESPONSIBLE`, etc. ouvrait toujours sa session support par le lien de
  l'admin (le compte agent est retrouvé par `snuReferentId`).
- **Connexion directe** : le compte agent reste utilisable par mot de passe sur snupport-app s'il en a un.
- **Statut `INACTIVE`** : la synchro continuait de pousser les référents inactifs (filtre sur le rôle seul).

## 2. Correctifs

| Où | Correctif |
| --- | --- |
| `snupport-api/src/controllers/v0/referent.js` | nouvelle route POST `/v0/referent/reconcile` (apikey) : reçoit la liste complète des référents habilités et supprime les comptes référents rattachés (`snuReferentId`) à un référent absent de la liste. Liste vide refusée (400). |
| `api/src/crons/syncReferentSupport.js` | exclut les référents `INACTIVE` de la synchro ; appelle ensuite la réconciliation avec **tous** les référents départementaux/régionaux actifs (pas seulement les modifiés des 24 h), ce qui rattrape aussi les changements anciens et les DELETE échoués. Comptes révoqués signalés sur Slack. |
| `api/src/controllers/SNUpport.ts` | GET `/SNUpport/signin` réservé à `REFERENT_DEPARTMENT`/`REFERENT_REGION` : le changement de rôle coupe le SSO immédiatement, sans attendre la nuit. |
| `snupport-api/src/utils/ssoAgent.js` | la requête SSO exige en plus un compte agent de rôle référent (jamais `AGENT` ni `DG`). |

## 3. Choix

- **Réconciliation complète plutôt que révocation au fil de l'eau.** Le rôle et le statut d'un référent
  changent par plusieurs routes (PUT `/referent/:id`, invitations, scripts) : un appel dans chacune en
  oublierait. La liste complète envoyée chaque nuit est la source de vérité ; le SSO est coupé tout de
  suite côté API, la connexion par mot de passe au plus tard à la réconciliation suivante (2 h 45).
- **Suppression, comme DELETE `/v0/referent`.** Même effet que la suppression d'un référent ; si le
  référent redevient habilité, la synchro recrée son compte.
- **Garde-fous** : liste vide refusée par snupport-api, et l'API n'appelle pas la réconciliation si elle
  ne trouve aucun référent habilité. Les comptes sans `snuReferentId` (antérieurs à son introduction)
  et les agents du support ne sont jamais touchés.

## 4. Après déploiement

- Déployer **snupport-api avant l'API** : sinon la réconciliation reçoit une 404, signalée sur Slack
  (sans autre effet).
- Le premier passage révoquera d'un coup tous les comptes des référents déchus depuis l'origine : relire
  la liste postée sur Slack.
- Les comptes référents **sans `snuReferentId`** ne sont pas couverts : les compter côté support
  (`agents.countDocuments({ role: { $in: ["REFERENT_DEPARTMENT", "REFERENT_REGION"] }, snuReferentId: { $exists: false } })`)
  et les traiter à la main s'il en reste.

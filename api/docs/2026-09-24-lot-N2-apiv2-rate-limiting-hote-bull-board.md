# Lot N2 — apiv2 : rate limiting, contrôle d'hôte, Bull Board (M79, M80, L46)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-30 · Branche `fix/goo-30-lot-n2-apiv2`, base `origin/main` (`d4f5562f8`)

## Contexte

apiv2 est une application Clever Cloud distincte de l'api v1. Son origine (`app-….cleverapps.io`)
reste joignable sans passer par le WAF. Rien ne limitait le débit des requêtes, même sur les routes
coûteuses (exports, simulations d'affectation ou de bascule). Bull Board (`/v2/queues`) n'était
protégé que par une authentification basique. Il affiche le contenu des jobs, dont les liens
d'invitation `?token=` des référents de classe.

## État des constats sur `origin/main`

Les trois constats étaient encore ouverts : pas de `helmet`, pas de limiteur ni de contrôle d'hôte
dans `apiv2/src/main.ts`, et Bull Board sous authentification basique seule
(`apiv2/src/infra/Queue.module.ts`).

## Ce qui change

| Id | Avant | Après |
|---|---|---|
| M79 | Bull Board : auth basique seule ; jobs EMAIL conservés indéfiniment, jetons visibles | liste d'IP `BROKER_MONITOR_ALLOWED_IPS` (fermé en 404 si vide sur un environnement déployé) ; 20 échecs d'auth / 15 min / IP puis 429 ; données et résultats de jobs affichés avec jetons masqués (`MaskedBullMQAdapter`) ; file EMAIL en `removeOnComplete`, échecs purgés après 7 jours |
| M80 | aucun rate limiting | plafond global de 3 000 requêtes / 5 min ; `POST` d'export, simulation, validation et import limités à 10 / 15 min. Le compteur est tenu par utilisateur si le JWT est valide, par IP sinon. Il vit dans le Redis du broker et laisse passer les requêtes si Redis tombe. Réponse 429 `TOO_MANY_REQUESTS`. |
| L46 | aucun contrôle d'hôte, aucun en-tête de sécurité | sur les environnements déployés, `Host` différent de l'hôte de `APIV2_URL` (ou de `ALLOWED_HOSTS`) → 421 ; `GET /` et `/health` exemptés (sondes) ; `helmet` (CSP désactivée sur `/queues` seulement) ; `trust proxy` réglé comme la v1 (`TRUST_PROXY_HOPS`) |

Les confs nginx des images `back` et `all` (staging, CI, recettes) transmettent désormais `Host`
au bloc `/v2`, comme elles le faisaient déjà pour la v1. Sans cela, le contrôle d'hôte aurait
refusé toutes les requêtes.

**Écart assumé avec le ticket :** les jetons d'invitation restent dans le payload des jobs EMAIL.
Le consommateur envoie l'URL telle quelle à Brevo : la remplacer par une référence par id
obligerait le module de notification à relire le référent en base. Le masquage à l'affichage et la
purge à l'envoi ferment l'exposition via Bull Board. Le jeton ne reste en clair que dans Redis,
qui n'est pas exposé.

## Démonstration

`apiv2/src/infra/security/Security.spec.ts` :

- hôte de `APIV2_URL` (avec port, en majuscules), hôtes supplémentaires → 200 ;
  `Host: app-1234.cleverapps.io` → 421 ; sondes `GET /` et `/v2/health` → 200, `POST /` → 421 ;
- classification des routes coûteuses (le webhook Brevo n'en fait pas partie) ; 11e export → 429,
  les autres routes restent servies ; quota distinct par clé ;
- masquage des `?token=` et des clés `*token*`, `apiKey` ; Bull Board fermé sans liste d'IP en
  environnement déployé, IP hors liste → 404 ; 21e tentative après 20 échecs d'auth basique → 429,
  même avec les bons identifiants, sans que les succès précédents comptent.

## Actions de déploiement

- **Avant la mise en production** : renseigner `BROKER_MONITOR_ALLOWED_IPS` sur PROD-SNU-APIV2 et
  sur staging si Bull Board doit rester accessible. Sinon il répond 404.
- Vérifier après déploiement qu'un appel à `https://api.snu.gouv.fr/v2/…` passe, et que l'origine
  `…cleverapps.io/v2/…` répond 421. Si le WAF réécrivait `Host`, ajouter l'hôte vu par
  l'application à `ALLOWED_HOSTS`.
- Vérifier `TRUST_PROXY_HOPS` sur apiv2 (même valeur que sur l'api v1). Une valeur trop basse
  compte toutes les requêtes sur l'IP du proxy : le plafond global devient alors collectif.
- **Infra, hors code** : restreindre l'origine Clever d'apiv2 aux IP du WAF (OGo).

## Hors périmètre / à surveiller

- `GET /testsentry` reste public et lève volontairement une erreur ; il est désormais soumis au
  plafond global.
- Les quotas sont des estimations prudentes. S'ils gênent l'usage réel, les ajuster dans
  `RATE_LIMITS` (`apiv2/src/infra/security/RateLimit.ts`).

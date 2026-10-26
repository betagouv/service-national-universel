# Lot T2 — intégrations externes et routes publiques (M40, M64, M71, M72, L28, L29, L37)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `5d824f300`
(branche `fix/goo-22-lot-t2-integrations`, ticket Linear GOO-22).

## 1. Constat

Tous les constats étaient encore ouverts sur `origin/main`.

| Id | Route / code | Défaut | Correctif |
| --- | --- | --- | --- |
| M71 | `GET /jeveuxaider/getToken`, `/actions`, `/signin` | clé statique comparée par `!==`, lue en query, sans limiteur ; le `token_jva` émis avait **exactement le contenu d'un JWT de session** (`__v: "0"`, 2 h) : présenté en `Authorization: JWT …`, il ouvrait une session admin sans passer par `/signin` | comparaison en temps constant, en-tête `x-api-key`, limiteur, jeton d'échange dédié (5 min) refusé comme session |
| M64 | `POST /preinscription/eligibilite`, `/create-lead` | inscription publique d'un email arbitraire à une liste Brevo | routes supprimées (aucun appelant depuis #5358) |
| M40 | `POST /waiting-list` | relais d'emails public, sans validation d'adresse ni limitation, document renvoyé | route supprimée (aucun appelant) |
| L37 | `GET /gouv.fr/api-education` | proxy public, `name` et `city` injectés tels quels dans la clause ODSQL | route et service supprimés (aucun appelant depuis #5315) |
| M72 | `getAllPdfTemplates` | fonds des attestations et convocations (signatures des ministres) téléchargés dans `public/images/`, que `express.static` sert sans authentification | téléchargés dans `api/pdf-templates/`, hors du dossier statique |
| L28 | `JVARepository.fetchStructureById` | clé d'API JVA en query string sur les appels sortants | clé en en-tête `apikey`, repli journalisé sur la query |
| L29 | `JVAService.updateMission` | la synchro rouvrait une mission annulée (CANCEL → WAITING_VALIDATION), réaffectait tuteur et structure, et calculait `placesLeft` par différence (valeurs négatives possibles) | voir § 2.4 |

## 2. Correctifs

### 2.1 M71 — intégration JeVeuxAider

- `requireJvaApiKey` : la clé est lue dans l'en-tête `x-api-key` et comparée par
  `crypto.timingSafeEqual` sur des empreintes SHA-256, de même longueur quelle que soit la clé
  reçue. Un `JVA_TOKEN` absent refuse tout, alors qu'il levait une 500.
- La query `api_key` reste acceptée **le temps que JVA migre** : chaque usage produit un
  `logger.warn`. Retirer le repli (`getJvaApiKey`) quand ces avertissements cessent.
- Limiteur `jva-api-key` sur `/getToken` et `/actions` : 20 clés refusées par IP et par quart
  d'heure. Seules les clés refusées consomment du quota, pas les emails inconnus : le back de JVA
  appelle ces routes pour tous ses responsables depuis quelques IP.
- `token_jva` porte désormais `__v: "jva-1"` et `type: "jva_signin"` et expire au bout de 5 minutes.
  Tous les validateurs de session (passport, `/signin/token`, `optionalAuth`, `AddUserToRequest`
  d'apiv2) exigent `__v === "0"` et le refusent. `/jeveuxaider/signin` n'accepte que ce type de
  jeton, et refuse un JWT de session.
- `/signin` vérifie aussi le rôle (RESPONSIBLE / SUPERVISOR), le statut (ni INACTIVE ni DELETED) et
  que ni le mot de passe ni la déconnexion n'ont changé depuis l'émission, comme passport.
  `/getToken` refuse les comptes INACTIVE, ce qui couvre les comptes créés par le cron JVA (H49),
  ainsi que les structures non JVA.

### 2.2 M64, M40, L37 — routes publiques sans appelant

Supprimées avec le code qu'elles étaient seules à utiliser : `api/src/preinscription/`,
`controllers/waiting-list.js`, `controllers/gouv.fr/`, `services/gouv.fr/api-education.ts`,
`getFilteredSessionsForInscription`, `MAILING_LISTS`, `validateWaitingList` et les types
`PreinscriptionRoutes` de snu-lib. `WaitingListModel` est conservé, car la collection existe en
base. Le test `phase1/waiting-list.test.ts` est supprimé ; jest ne l'exécutait pas.

### 2.3 M72 — fonds des attestations

Nouvelle entrée `config.PDF_TEMPLATES_ROOTDIR` (`api/pdf-templates/`), utilisée par
`getAllPdfTemplates` et par les quatre gabarits `templates/certificate/*`. Les images génériques
(logo, Marianne) restent dans `public/images/`. Le dossier est créé au démarrage. L'image Docker
(`/run/api/`) et le build Clever sont inscriptibles, comme l'était `public/images/`.

### 2.4 L29 — synchronisation des missions JVA

- Une mission CANCEL, REFUSED ou ARCHIVED côté SNU garde son statut. Ses autres champs (dates,
  places, adresse) sont toujours synchronisés.
- Une mission déjà rattachée garde `tutorId`, `tutorName`, `structureId` et `structureName`. Seule
  une mission sans tuteur est rattachée, et `updateApplicationTutor` n'est appelé que dans ce cas.
- `placesLeft = max(0, placesTotal − candidatures VALIDATED/IN_PROGRESS/DONE)`, même règle que
  `applicationService.updateMission`.

Effet de bord : une mission annulée par la synchro elle-même, parce que sa date de début dépasse la
limite, n'est plus rouverte automatiquement si JVA corrige la date. Il faut la rouvrir à la main.
`cancelOldMissions` est désactivé (US-489), c'est donc le seul chemin concerné.

### 2.5 L28 — appels sortants JVA

La clé part dans l'en-tête `apikey`. JVA n'a pas confirmé accepter cet en-tête (le dépôt
jeveuxaider-back n'est pas public). Sur une réponse 401 ou 403, le code refait l'appel avec la clé
en query et journalise un avertissement. Si cet avertissement n'apparaît jamais en production,
retirer le repli.

## 3. Tests

`api/src/__tests__/lot-t2-integrations-externes.test.ts` (13 cas) et
`api/src/__tests__/crons/missionsJVA/JVAService.test.ts` (6 cas ajoutés) :

- clé JVA erronée ou absente → 401 ; clé en en-tête → 200 ; 21 clés erronées → 429 ; 25 emails
  inconnus avec la bonne clé → toujours 401, pas 429 ;
- `token_jva` présenté à `GET /signin/token` → 401 ; JWT de session présenté à
  `/jeveuxaider/signin` → 401 ; `token_jva` émis avant une déconnexion → 401 ; parcours nominal →
  302 et cookie `jwt_ref` ;
- `/preinscription/*`, `/waiting-list`, `/gouv.fr/api-education?name="; DROP` → 404 ;
- `PDF_TEMPLATES_ROOTDIR` hors de `public/` ;
- mission CANCEL, REFUSED ou ARCHIVED toujours dans ce statut après la synchro ; tuteur et
  structure conservés ; `placesLeft` jamais négatif.

## 4. Actions de production

1. **Rotation de `JVA_TOKEN`** (clé entrante, M71) : elle a transité en query string. La nouvelle
   valeur est à transmettre à JVA.
2. **Rotation de `JVA_API_KEY`** (clé sortante, L28) : elle aussi a transité en query string, à
   demander à JVA.
3. **Prévenir JVA** : passer `api_key` dans l'en-tête `x-api-key` sur `/getToken` et `/actions`,
   puis retirer le repli en query une fois les `logger.warn` taris.
4. Supprimer les éventuelles copies résiduelles de `public/images/certificates/` et
   `public/images/convocation/`. Sur Clever Cloud, chaque déploiement repart d'un disque neuf ;
   c'est donc un point de vigilance pour les postes de développement uniquement.

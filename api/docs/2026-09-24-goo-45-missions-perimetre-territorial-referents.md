# GOO-45 — missions hors territoire modifiables par les référents

Constat de recette sur la CI (24/09), hors audit du 21/09. Vérifié et corrigé le 2026-09-24 sur
`origin/main` @ `93ad5a192` (ticket Linear GOO-45).

## 1. Constat et cause

`isMissionInUserScope` (`api/src/services/missionAccess.ts`) renvoyait `true` pour les référents
départementaux et régionaux. Leur `MISSION_FULL` est seedée sans policy. `isWriteAuthorized` et
`isDeleteAuthorized` étaient donc toujours vrais : un référent validait, refusait, annulait, archivait,
modifiait ou supprimait n'importe quelle mission du pays. Annuler ou archiver une mission annule aussi
ses candidatures en cours et prévient les volontaires. Le contexte Elasticsearch des missions ne bornait
pas non plus ces rôles.

## 2. Correctifs

Périmètre d'un référent : le département de la mission fait partie de `user.department` (référent
départemental) ; la région de la mission est égale à `user.region` (référent régional). L'administrateur
reste national.

| Route | Correctif |
| --- | --- |
| `PUT /mission/:id`, `DELETE /mission/:id` | mission stockée dans le territoire, sinon 403 |
| `POST /mission/multiaction/change-tutor` | chaque mission du lot dans le territoire |
| `POST /mission`, `PUT /mission/:id` | un référent ne crée ni ne déplace une mission hors de son territoire (`checkMissionPayload`) |
| `GET /mission/:id/patches` | mission dans le territoire |
| `GET /mission/:id/application` | hors territoire : seules les candidatures des volontaires du référent (`youngDepartment`), comme l'index `application` |
| `/elasticsearch/mission/search\|export`, `by-structure`, `by-tutor` | filtre `department` / `region` dans `buildMissionContext` |

## 3. Choix

- **Fiche mission (`GET /mission/:id`) laissée lisible.** Un référent suit les candidatures de ses
  volontaires, y compris sur des missions d'un autre département. Ces données sont celles que la
  mission publie aux volontaires.
- **Recherche « proposer une mission » (`/elasticsearch/mission/propose/*`) laissée nationale.** Elle
  ne liste que des missions validées et visibles, qu'un volontaire trouve lui-même au-delà de son
  département.
- **Front non modifié.** La liste n'affiche plus les missions hors territoire. Sur la fiche d'une
  mission hors territoire, ouverte depuis une candidature, le sélecteur de statut reste affiché, mais
  l'API répond 403.

## 4. Tests

- `api/src/__tests__/mission-security.test.ts`, bloc GOO-45 :
  - référent du 92 : 403 sur `PUT` et `DELETE` d'une mission du Rhône et d'une mission de Paris ; 200 sur une mission du 92 ;
  - déplacement et création hors territoire refusés ;
  - référent régional, changement de tuteur, historique ;
  - candidatures filtrées ; fiche lisible.
- `api/src/__tests__/elasticsearch-mission-context.test.ts` : contexte ES borné, `propose` national.

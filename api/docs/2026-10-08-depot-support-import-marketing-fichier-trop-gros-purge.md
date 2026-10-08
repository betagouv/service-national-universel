# Dépôt du support et import du plan marketing — purge des fichiers à la fermeture de la connexion

Suite de `2026-10-08-depots-fichier-trop-gros-purge-a-la-fermeture.md` (#5501). Constaté le 2026-10-08,
puis corrigé.

## 1. Correctif

`POST /SNUpport/upload` et `POST /plan-marketing/import` montaient express-fileupload directement, sans
`tempFileUpload()`. Quand la connexion se ferme avant la fin de l'analyse de la requête, plus aucun fichier
temporaire ne reste :

- les fichiers déjà reçus sont supprimés à la fermeture. Jusqu'ici, leur purge était faite par le gestionnaire de
  la route, qui n'était jamais appelé ;
- un fichier plus gros que la limite dont la partie n'est pas terminée est supprimé, et son descripteur refermé,
  à la fermeture de la connexion, comme sur les routes de #5501 ;
- un fichier sous la limite dont la partie n'est pas terminée l'est toujours au délai d'envoi d'express-fileupload.

La requête n'est alors plus transmise au gestionnaire : personne ne recevrait la réponse. Les deux routes gardent
leurs options, et un envoi qui va à son terme est traité comme avant.

## 2. Choix

- **Même mécanisme que `tempFileUpload()`** : il est exporté de `api/src/middlewares/tempUpload.ts`
  (`abandonableFileUpload`, qui prend les options d'express-fileupload) et `tempFileUpload()` l'utilise.
- **Signal = fermeture de la réponse** : elle est émise à la coupure de la connexion, et aussi à la fin d'une
  réponse déjà envoyée (cas du 413 de `tempFileUpload()`). Tant que la requête n'a pas été transmise au
  gestionnaire, cette fermeture purge les fichiers reçus, et la fin de l'analyse qui suit ne transmet plus la
  requête. Pour `tempFileUpload()`, le résultat est inchangé : après un 413, les fichiers étaient déjà purgés et le
  gestionnaire déjà écarté.
- **Fichier trop gros inachevé** : abandonné à la fermeture de la socket (mécanisme de #5501), seul signal fiable
  une fois une réponse envoyée.
- **Typage** : la lecture des fichiers passe par `requestFiles` (#5497), `req.files` n'étant pas typé dans
  l'arbre élagué du build de production.

## 3. Tests

`api/src/__tests__/lot-p29-fichier-trop-gros-coupure.test.ts`, client `http.request` en keep-alive :

- sur les deux routes réelles, coupure par le client en plein fichier trop gros (seul ou précédé d'un petit fichier
  complet) ou entre deux parties : aucun des fichiers temporaires ouverts par la requête ne reste, et le gestionnaire
  n'est pas appelé. Ces six cas échouaient avant le correctif (fichiers restés dans `/tmp`) ;
- sur `abandonableFileUpload` avec un délai d'envoi court, coupure en plein fichier sous la limite : le fichier est
  supprimé et le gestionnaire n'est pas appelé (il l'était avant le correctif) ;
- envoi complet sous la limite sur les deux routes : la requête est traitée (200) et son fichier temporaire supprimé.

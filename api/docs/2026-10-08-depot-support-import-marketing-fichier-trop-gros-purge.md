# Dépôt du support et import du plan marketing — purge d'un fichier trop gros à la fermeture de la connexion

Suite de `2026-10-08-depots-fichier-trop-gros-purge-a-la-fermeture.md` (#5501). Constaté le 2026-10-08,
puis corrigé.

## 1. Correctif

`POST /SNUpport/upload` (10 Mo) et `POST /plan-marketing/import` (8 Mo) montaient express-fileupload
directement, sans `tempFileUpload()`, et n'avaient donc pas la purge à la fermeture de la connexion. Le
fichier temporaire tronqué d'un fichier plus gros que la limite est maintenant supprimé, et son descripteur
refermé, quand la connexion se ferme avant la fin de sa partie. Les fichiers déjà reçus dans la même requête
sont supprimés aussi : jusqu'ici, la requête restait en suspens et leur purge, faite par le gestionnaire de
la route, n'avait jamais lieu.

Aucune réponse ne change : les deux routes gardent leurs options (même limite, pas de refus en 413), et un
envoi qui va à son terme est traité comme avant.

## 2. Choix

- **Même mécanisme que `tempFileUpload()`** : il est exporté de `api/src/middlewares/tempUpload.ts`
  (`abandonableFileUpload`, qui prend les options d'express-fileupload) et `tempFileUpload()` l'utilise.
- **Signal = fermeture de la socket** : sans réponse partie, la requête signale aussi la coupure, mais
  après une réponse (cas de `tempFileUpload()`), seule la socket le fait. Un seul signal couvre les deux.
- **Requête abandonnée non transmise au gestionnaire** : express-fileupload passe la main au gestionnaire
  quand le fichier est abandonné. Personne ne recevrait la réponse, et le gestionnaire traiterait les
  fichiers déjà reçus (quota, antivirus, stockage) : la requête s'arrête là, ses fichiers sont purgés.
  Pour `tempFileUpload()`, le résultat est inchangé (la réponse 413 était déjà partie).
- **Typage** : la lecture des fichiers passe par `requestFiles` (#5497), `req.files` n'étant pas typé dans
  l'arbre élagué du build de production.

## 3. Tests

`api/src/__tests__/lot-p29-fichier-trop-gros-coupure.test.ts`, sur les routes réelles, client
`http.request` en keep-alive :

- fichier de deux fois la limite sans fin de partie, seul ou précédé d'un petit fichier complet, puis
  coupure par le client : aucun des fichiers temporaires ouverts par la requête ne reste, et le gestionnaire
  n'est pas appelé. Les quatre cas échouaient avant le correctif (fichiers restés dans `/tmp`) ;
- envoi complet sous la limite : la requête est traitée (200) et son fichier temporaire supprimé.

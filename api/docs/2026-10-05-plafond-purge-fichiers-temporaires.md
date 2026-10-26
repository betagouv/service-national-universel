# Dépôts de fichiers — plafond du nombre de fichiers et purge des fichiers temporaires

Constat PM17 de l'audit du 25/09/2026 (lot P29), vérifié ouvert le 2026-10-05 sur `origin/main`
@ `07cdbe99a`, puis corrigé. Les dépendances du lot (P02, P05, P12, P23, #5412) sont fusionnées.

## 1. Correctif

Les quatre routes de dépôt partagent désormais le middleware `api/src/middlewares/tempUpload.ts`
(`tempFileUpload()`), qui remplace leur montage `fileUpload` :

| Route |
| --- |
| `POST /young/file/:key` |
| `POST /young/:id/documents/:key` |
| `POST /application/:id/file/:key` |
| `POST /referent/file/:key` |

- **Plafond** : une requête ne peut porter que 10 fichiers au plus (`MAX_UPLOAD_FILES`). Au-delà, la
  réponse est un 413 (`INVALID_BODY`) et rien n'est conservé.
- **Taille** : la limite de 10 Mo par fichier est inchangée, mais un fichier plus gros est maintenant
  refusé en 413 (JSON, code `INVALID_BODY`) au lieu d'être transmis tronqué au traitement. La réception
  va à son terme avant la purge, pour que tous les fichiers déjà reçus soient supprimés et que le
  traitement de la route ne soit pas exécuté après la réponse.
- **Purge** : les fichiers temporaires de la requête sont supprimés à la fin de chaque réponse, quel
  que soit le statut (200, 400, 403, 404, 413, 500). Une erreur de suppression est journalisée et
  n'altère jamais la réponse.

## 2. Choix

- **N = 10** : les dépôts courants portent un ou deux fichiers ; l'écran d'équivalence renvoie la liste
  cumulée des fichiers à chaque ajout, sans plafond côté front. 10 laisse de la marge à ce dernier
  usage sans changer l'expérience.
- **Contrôle après réception** : le parseur ignore silencieusement les fichiers au-delà de sa limite.
  Pour détecter un dépassement, le plafond du parseur est donc monté à N + 1 et le middleware refuse
  toute requête qui en contient plus de N. Au plus N + 1 fichiers sont écrits, tous purgés.
- **`/SNUpport/upload`** : non modifié, il a déjà son propre plafond (lot M38) et sa purge locale.
- **Import du plan marketing** : non modifié (limite et purge propres).

## 3. Hors périmètre, signalé

- Si le client coupe la connexion en plein envoi d'un fichier, le fichier partiel est supprimé par le
  délai d'envoi du parseur (60 s) et non à la coupure ; la purge à la fin de la réponse peut aussi
  survenir avant la fin du traitement de la route. Comportement non modifié par ce lot, à traiter
  séparément si besoin.
- Pas de limite cumulative par clé côté serveur dans `documents.js` : ce serait un changement
  fonctionnel, à décider séparément.
- Dans `documents.js`, la limite de 3 CNI repose sur une catégorie fournie par le client : non traité ici.

## 4. Tests

`api/src/__tests__/lot-p29-fichiers-temporaires.test.ts` : fonction de purge (fichiers seuls ou en
tableau, erreur de suppression non propagée), middleware sur une application minimale (nominal à 1 et
2 fichiers, exactement 10 fichiers, au-dessus du plafond, fichier trop gros, purge après 400/403/500),
et câblage des quatre routes réelles (purge sur chemin d'échec, 413 au-dessus du plafond).

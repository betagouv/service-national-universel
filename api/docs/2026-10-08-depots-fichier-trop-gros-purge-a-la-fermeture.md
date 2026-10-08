# Dépôts de fichiers — purge d'un fichier trop gros à la fermeture de la connexion

Suite du lot P29 (#5466, `api/src/middlewares/tempUpload.ts`). Constaté le 2026-10-08 sur `origin/main`
@ `6569e3fa7`, puis corrigé.

## 1. Correctif

Sur les quatre routes de dépôt montées avec `tempFileUpload()`, un fichier plus gros que la limite de
10 Mo reste refusé en 413 (`INVALID_BODY`). Son fichier temporaire tronqué est maintenant supprimé, et
son descripteur refermé, aussi quand la connexion se ferme avant la fin de l'envoi de ce fichier, que
la fermeture vienne du client ou du serveur après le 413. Jusqu'ici, ni la purge de fin de réponse ni
le délai d'envoi du parseur ne couvraient ce cas.

Rien ne change quand l'envoi va à son terme : la réception continue après le 413 et tous les fichiers
reçus sont purgés, comme avant.

## 2. Choix

- **Abandon à la fermeture de la connexion, pas dès le 413** : l'analyse doit pouvoir aller à son terme
  après le 413 pour que les fichiers suivants soient purgés (choix du lot P29). Un fichier tronqué n'est
  donc abandonné que si la connexion se ferme avant la fin de sa partie.
- **Sans modifier la dépendance** : le middleware récupère le parseur qu'express-fileupload branche sur
  la requête, et abandonne le fichier tronqué comme le fait le délai d'envoi d'express-fileupload, qui
  se charge alors de supprimer le fichier.
- **Connexion maintenue ouverte sans rien envoyer** : Node la ferme au bout de son délai de réception
  d'une requête (`requestTimeout`, 300 s par défaut, non modifié dans l'api), et la purge a lieu à ce
  moment-là.

## 3. Tests

`api/src/__tests__/lot-p29-fichiers-temporaires.test.ts`, bloc « fichier plus gros que la limite dont
la partie ne se termine pas » : un seul fichier de deux fois la limite, sans fin de partie, avec le
délai d'envoi par défaut ; le dossier temporaire dédié doit être vide, que le client coupe la connexion
après le 413 (keep-alive) ou que le serveur la ferme (`Connection: close`). Les deux cas échouaient
avant le correctif.

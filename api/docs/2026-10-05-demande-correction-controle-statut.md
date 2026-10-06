# Demandes de correction : contrôle du statut avant toute suppression de pièce

Lot V14b (api) - `api/src/controllers/correction-request.ts`.

## Ce qui est corrigé

Dans `POST /correction-request/:youngId`, le contrôle de statut (seuls les dossiers en attente de validation ou de correction se rouvrent, l'ADMIN gardant toute latitude) est désormais fait **avant** la boucle qui supprime les pièces d'identité. Une requête refusée n'a plus aucun effet de bord : ni suppression de pièce, ni écriture, ni historique, ni email.

Seul l'ordre des opérations change : mêmes statuts autorisés, mêmes rôles, mêmes codes et messages d'erreur.

## Autres routes du fichier (vérifiées)

- `DELETE /:youngId/:field` : le contrôle de transition précède l'enregistrement, aucune suppression de pièce n'a lieu avant. Rien à corriger.
- `POST /:youngId/remind` : ne supprime aucune pièce et ne dépend pas du statut du dossier. Rien à corriger.

## Tests

`api/src/__tests__/correction-request-security.test.ts` :

- dossiers `VALIDATED`, `REFUSED`, `WITHDRAWN` x raisons `UNREADABLE`, `OTHER`, `NOT_SUITABLE` : 403, `deleteFile` non appelé, `files.cniFiles` inchangé, aucun email ;
- dossiers `WAITING_VALIDATION`, `WAITING_CORRECTION` x les mêmes raisons : pièces supprimées et demande enregistrée, comme avant ;
- l'ADMIN conserve son comportement sur un dossier validé.

Tests api à lancer en série (`--maxWorkers=1`).

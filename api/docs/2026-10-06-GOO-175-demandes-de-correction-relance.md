# Lot : relance des demandes de correction (GOO-175)

Périmètre : `api/src/controllers/correction-request.ts` (`POST /correction-request/:youngId/remind`) et `api/src/__tests__/correction-request-security.test.ts`.

## 1. Corrigé

| Surface | Correctif |
| --- | --- |
| `POST /correction-request/:youngId/remind` | Seules les demandes au statut `SENT` ou `REMINDED` passent (ou restent) en `REMINDED`, avec `moderatorId` et `remindedAt`. Les demandes `PENDING`, `CORRECTED` et `CANCELED` ne sont plus modifiées. |
| Réponse « rien à relancer » | S'il n'existe aucune demande `SENT` ou `REMINDED`, la route répond 400 `NOT_FOUND` sans écriture ni email, comme pour un dossier sans demande. |

Droits (`canEditYoungInScope`), email `INSCRIPTION_REMIND_CORRECTION` et codes de réponse inchangés. Le comportement rejoint celui annoncé par l'en-tête du fichier.

## 2. Effet visible

Le bouton « Relancer le volontaire » n'est affiché que lorsqu'une demande est `SENT` ou `REMINDED` (`admin/src/scenes/phase0/view.tsx:78-79`, `YoungFooterSent.tsx:56`) : le parcours normal est inchangé. Sur un écran périmé (plus aucune demande ouverte), l'appel (`view.tsx:165-175`) affiche désormais « Erreur ! Ressource introuvable » (`translate("NOT_FOUND")`, `packages/lib/src/translation.ts:193-194`) au lieu de « Le volontaire a été relancé ».

## 3. Hors périmètre

Les autres routes du fichier et le front ne sont pas modifiés.

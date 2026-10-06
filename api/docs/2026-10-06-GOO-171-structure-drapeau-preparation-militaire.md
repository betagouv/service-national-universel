# Lot V14a : drapeau « préparation militaire » à la création d'une structure (GOO-171)

Périmètre : `api/src/controllers/structure.ts` (`POST /structure`, `PUT /structure/:id`) et `api/src/__tests__/structure.test.ts`.

## 1. Corrigé

| Surface | Correctif |
| --- | --- |
| `POST /structure` | La création applique la même règle que la modification pour un responsable ou un superviseur : demander le drapeau « préparation militaire » à `true` est refusé (403, rien n'est créé) ; toute autre valeur est retirée du corps et la structure naît sans le drapeau. |
| `PUT /structure/:id` | Comportement inchangé ; la règle est désormais portée par la même fonction (`applyMilitaryPreparationRule`), partagée avec la création pour qu'elle ne diverge plus. |

L'administrateur et les référents territoriaux gardent le droit de poser le drapeau, à la création comme à la modification.

## 2. Choix

- **Refus sur changement, retrait sinon** (comme `PUT`) plutôt que refus de toute présence du champ : le formulaire de création de l'admin envoie `isMilitaryPreparation: "false"` quel que soit le rôle (`admin/src/scenes/structure/create.jsx`, valeur initiale et envoi du corps complet) ; un refus sur toute présence casserait la création d'un superviseur.
- **Valeur de référence à la création : « non PM »** (une structure naît sans le drapeau), donc seul `true` constitue un changement.

## 3. Effet visible

Aucun pour les écrans existants : le formulaire de création n'envoie que `"false"` pour ces rôles (sélecteur masqué hors admin et référents), la création réussit comme avant.

## 4. Hors périmètre

Aucun autre champ de la création n'est modifié.

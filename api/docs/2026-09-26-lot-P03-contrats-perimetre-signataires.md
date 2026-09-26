# Lot P03 — contrats d'engagement : périmètre d'écriture et signataires

Audit de sécurité de la production du 25/09/2026, constat PH4 (ticket Linear GOO-58). Vérifié ouvert
puis corrigé le 2026-09-26 sur `origin/main` @ `0e80b1adf`.

## 1. Correctifs

| Point | Route | Correctif |
| --- | --- | --- |
| Périmètre | `POST /contract` (création et mise à jour) | `isContractInUserScope` s'applique à tous les rôles, sur le contrat existant et sur la cible : les référents départementaux et régionaux ne créent ni ne modifient plus de contrat hors du département ou de la région du jeune (403) |
| Rattachement | `POST /contract` | candidature et jeune sont résolus **avant** toute écriture. La candidature doit appartenir au jeune et à la structure du contrat, et un contrat existant ne change plus de candidature ni de jeune (403, rien n'est écrit) |
| Majorité | `POST /contract` | `isYoungAdult` et `youngBirthdate` sont recalculés depuis `young.birthdateAt`. Un mineur déclaré majeur par le corps ne se passe plus de la signature de ses représentants légaux |
| Signataires | `POST /contract`, `POST /contract/:id/send-email/:type` | `youngEmail`, `parent1Email` et `parent2Email` viennent du dossier du jeune. Les liens de signature ne partent plus vers une adresse saisie par l'auteur du contrat. Au renvoi d'un lien, les adresses d'un contrat antérieur sont resynchronisées sur le dossier |

## 2. Choix

- Le contrôle spécifique responsable/superviseur est remplacé par `isContractInUserScope`, déjà
  utilisé sur les routes de lecture. Un responsable sans structure reçoit désormais 403 au lieu de 404.
- La majorité est calculée à la date du jour, comme le fait déjà l'écran admin.
- Le formulaire admin laisse encore modifier les adresses du jeune et des représentants légaux :
  ces saisies sont ignorées par le serveur. Pour corriger une adresse, il faut modifier le dossier
  du jeune.

## 3. Reste ouvert

- `projectManagerEmail` (représentant de l'État) reste saisi par le client : aucune source serveur
  fiable n'existe pour cette adresse. Décision produit à prendre.
- `youngDepartment`, qui choisit les référents en copie du mail au représentant de l'État, reste
  également saisi par le client.

## 4. Après déploiement

- Rechercher les contrats `isYoungAdult = "true"` d'un jeune mineur à la date du contrat.
- Rechercher les contrats dont les adresses de signataires diffèrent de celles du dossier.
- Rechercher les contrats `VALIDATED` dont toutes les signatures tombent dans un intervalle très court.

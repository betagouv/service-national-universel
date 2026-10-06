# Lot V06b : relève IMAP du support (GOO-169)

Périmètre : `snupport-api/src/imap.js` et ses tests. Tâche de fond (cron toutes les 30 minutes), aucune
route, aucun code HTTP ni forme de réponse modifié : aucun effet côté app, admin ou snupport-app.

## 1. Corrigé

| Surface | Correctif |
| --- | --- |
| `extractMailData` | Un email sans expéditeur, avec un expéditeur vide ou sans adresse est ignoré (journal : identifiant du message seul, sans adresse ni contenu). Un destinataire vide ne provoque plus d'erreur. |
| `Module.fetch` | Chaque email est traité isolément : une erreur sur un message n'interrompt plus la boîte et n'empêche plus `lastFetch` d'avancer. |
| `readMails` / nouvelle `readMailsInBatches` | Les messages sont téléchargés par groupes de 10, avec un budget de 50 Mo par groupe, analysés par 3 au plus en parallèle, et ingérés avant le téléchargement du groupe suivant : plus aucune agrégation de tous les corps en mémoire. Les messages que le budget d'un groupe ne permet pas de télécharger sont repris en tête du groupe suivant, dans le même cycle. |
| `copyRecipient` | Un email sans en-tête To ne place plus d'adresse indéfinie dans la liste des destinataires en copie. |

## 2. Choix

- **Expéditeur absent : ignorer plutôt que repli.** Le contact est retrouvé ou créé par adresse
  (`resolveUnverifiedContact`) ; sans adresse, un repli créerait un contact sans correspondance réelle.
  Destinataire vide : repli, le ticket est rattaché à `contact@` comme le code le prévoyait déjà.
- **Pas de plafond par cycle ni de curseur partiel.** La recherche `SINCE` a une granularité d'un
  jour : chaque cycle relit tous les messages du jour courant (dédoublonnés par identifiant de
  message dans `addMessage`). Un cycle interrompu en cours de journée ne pourrait donc jamais
  avancer `lastFetch` et bloquerait la boîte ; la mémoire est déjà bornée par le traitement
  séquentiel des groupes, un plafond n'apporterait rien. `lastFetch` vaut `new Date()` après un cycle
  complet, comme avant ; il n'avance pas si le cycle échoue (reprise au cycle suivant).
- **`readMails` conservé** comme enveloppe de `readMailsInBatches` (collecte les lots et renvoie le
  tableau) : même signature et mêmes garanties (toujours résolue ou rejetée) pour ses appelants.

## 3. Hors périmètre / suites possibles

Curseur par UID plutôt que par date (prérequis à tout plafond de messages par cycle) ; garde de
recouvrement du cron ; antivirus ; reste de `snupport-api` ; garde de type de fichier.

## 4. Tests

`snupport-api/src/__tests__/imapBatchedFetch.test.js` (avec `helpers/fakeImapMailbox.js`, sans réseau
ni base) : expéditeur absent ou vide, destinataire absent ou vide, taille des groupes, concurrence
d'analyse, budget d'octets (trois messages de 20 Mo le même jour), plus de 200 messages le même jour,
message de plus de 25 Mo écarté, ordre d'ingestion, lot normal traité comme avant (vrai `addMessage`). Non-régression existante : `imapResilientFetch.test.js`.

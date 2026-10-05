# Verrou de connexion : la réponse ne dépend plus du mot de passe soumis

Date : 2026-10-05 · Constats PM5 (résiduel), M4, L27 et M65 de l'audit du 25/09/2026 ·
Branche `fix/signin-verrou-sans-oracle`, base `origin/main` (`b46218e79`)

Déploiement : api seul. Aucun contrat de front modifié, aucune migration.

## Ce qui est corrigé

`POST /young/signin` et `POST /referent/signin` (classe `Auth`, `auth.ts`) répondaient différemment à un compte
verrouillé selon que le mot de passe soumis était juste ou faux : la réponse, et le verrou qu'elle annonçait,
dépendaient du mot de passe. De plus, dès le 6e essai, même le bon mot de passe était refusé, alors que le contrat de
`consumeLoginAttempt` est que le délai posé vaut pour la tentative suivante.

Invariants rétablis :

- **Réponse indépendante du mot de passe.** Email inconnu, mot de passe faux, compte différé ou bloqué (avec le bon ou
  le mauvais mot de passe) : même statut (401), même code (`EMAIL_OR_PASSWORD_INVALID`), même corps. Le verrou et son
  échéance ne figurent plus dans la réponse de connexion.
- **Parité de traitement.** Une comparaison bcrypt est toujours exécutée ; pour un compte verrouillé c'est une
  comparaison factice (`compareAgainstDummyHash`), le mot de passe réel n'est pas consulté.
- **Aucune session pendant un verrou.** Un compte différé ou bloqué ne se connecte pas, même avec le bon mot de passe.
- **Verrou non prolongé.** Une tentative présentée pendant un verrou ne consomme rien et ne repousse pas l'échéance.
- **Le 6e essai reste évalué.** Un délai posé par une tentative ne refuse que la suivante : un utilisateur qui tape le
  bon mot de passe à son 6e essai se connecte, comme avant PM5.
- **Verrou décidé dans l'opération atomique.** Le pipeline de `consumeLoginAttempt` ne touche ni au compteur ni à
  l'échéance d'un compte dont le verrou est actif, et la fonction rend la tentative `blocked` ; la décision ne repose
  plus sur un document lu avant, qu'une requête concurrente a pu verrouiller entre-temps. Sous rafale, une seule
  tentative franchit le délai, les suivantes sont refusées sans rien consommer. `POST /young|referent/check_password`
  et `reset_password`, qui utilisent la même fonction, en bénéficient ; leurs réponses ne changent pas.

## Conséquence visible

Un titulaire légitime dont le compte est verrouillé voit désormais le message générique de connexion pendant la durée
du verrou, au lieu de l'écran « maximum de tentatives atteint » avec l'heure de déblocage. C'est inhérent à la
suppression de la dépendance au mot de passe : dire au seul détenteur du bon mot de passe que le compte est verrouillé
est exactement ce qui était à retirer.

## Examiné, sans modification

- `POST /young|referent/signin-2fa` : le plafond de 3 essais est porté par le filtre de `consume2FAAttempt`, sans
  rapport avec le verrou de connexion ; au-delà du plafond, le bon comme le mauvais code reçoivent la même réponse et
  aucune session n'est ouverte.
- `POST /agent/signin` de `snupport-api` : pas de compteur ni de verrou par compte, donc pas de réponse qui dépende de
  l'état d'un verrou.
- `POST /young|referent/check_password` et `reset_password` : routes authentifiées, le verrou y est annoncé à la
  session titulaire quel que soit le mot de passe.

## Fichiers touchés

`api/src/auth.ts` (`signin`), `api/src/services/auth/attemptCounters.ts` (`consumeLoginAttempt`).

## Tests

`api/src/__tests__/auth-anti-abus.test.ts` :

- indistinguabilité des réponses (jeune et référent), parité des comparaisons bcrypt, absence de session pendant un
  délai ou un blocage, verrou non prolongé, 6e essai évalué ;
- verrou posé entre la lecture du compte et la consommation de la tentative : le bon mot de passe est refusé ;
- `consumeLoginAttempt` : refus sans consommation sous verrou actif, une seule tentative franchit le délai sous
  rafale, valeurs rendues égales à l'état écrit en base à chaque transition (délai, plafond, blocage, fenêtre) ;
- M4 et PM6 : sous rafale le compteur ne dépasse plus le palier du délai (6) au lieu de compter chaque requête.

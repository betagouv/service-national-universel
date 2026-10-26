# Lot J — concurrence sur les places et compteurs (M57, L25)

Date : 2026-09-24 · Audit sécurité des API du 21/09/2026 · Ticket Linear GOO-37 · Branche `fix/goo-37-lot-j-reservation-places`, base `origin/main` (`d9d637442`)

## État des constats sur `origin/main`

Les deux constats ont été relus sur le code courant avant correction ; tous deux étaient encore ouverts.

- M57 : `PUT /young/:id/point-de-rassemblement` ne contrôlait la capacité de la ligne que si `meetingPointId` était
  fourni. Un `ligneId` seul écrivait la ligne sur le dossier du jeune sans aucun contrôle, même sur une ligne pleine.
- L25 : l'affectation, le choix du point de rassemblement et le choix du point de rendez-vous (legacy) lisaient le
  compteur de places, écrivaient le jeune, puis recomptaient. Entre la lecture et l'écriture, la requête pouvait attendre
  un envoi d'email Brevo : sur 20 demandes concurrentes pour la dernière place d'une session, toutes passaient.

## Ce qui change

| Id  | Où                                                                                 | Avant                                                                                    | Après                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M57 | `controllers/young/point-de-rassemblement.js`                                      | `ligneId` seul accepté, sans contrôle de capacité ; aucun contrôle du couple point/ligne | `Joi.and("meetingPointId", "ligneId")` → 400 si l'un manque. Le couple doit exister dans `LigneToPoint` (non supprimé) et la ligne appartenir à la cohorte **et** à la session du jeune, sinon 400. Le choix « par mes propres moyens » est inchangé |
| L25 | `controllers/young/point-de-rassemblement.js`                                      | lecture de `youngSeatsTaken`, écriture du jeune, recomptage                              | réservation atomique d'un siège (`updateOne` conditionné par `youngSeatsTaken < youngCapacity`, `$inc`) avant l'écriture du jeune ; 409 si la ligne est pleine                                                                                       |
| L25 | `controllers/young/phase1.ts` (`POST …/phase1/affectation`)                        | lecture de `placesLeft` et de `youngSeatsTaken`, envoi de l'email, écriture, recomptage  | réservation atomique de la place de session (`placesLeft >= 1`, `$inc: -1`) puis du siège de ligne, avant l'email et l'écriture du jeune ; 409 si l'une manque. La lecture préalable de `placesLeft` reste comme refus rapide (403)                  |
| L25 | `controllers/young/meeting-point.js` (bus legacy)                                  | lecture de `placesLeft`, écriture, recomptage                                            | réservation atomique (`placesLeft > 0`, `$inc: -1`) ; 409 si le bus est plein                                                                                                                                                                        |
| L25 | `planDeTransport/ligneDeBus/ligneDeBusService.ts` (`PUT /ligne-de-bus/:id/centre`) | `youngSeatsTaken > session.placesLeft` lu hors transaction                               | la réservation des `youngSeatsTaken` places dans la session cible se fait dans la transaction qui déplace la ligne et ses jeunes ; la transaction échoue (`OPERATION_NOT_ALLOWED`) si les places ont été prises entre-temps                          |

Les helpers sont regroupés dans `api/src/utils/placeReservation.ts`. Deux choix de mise en œuvre :

- **`updateOne` plutôt que `findOneAndUpdate`.** Le hook post-`findOneAndUpdate` de `mongoose-patch-history` plante
  (`Cannot set properties of null`) quand la condition ne correspond à aucun document, c'est-à-dire exactement dans le
  cas « plus de place ». La réservation lit donc `modifiedCount`, puis relit le document.
- **Échec après réservation : recomptage, pas `$inc` inverse.** Si l'écriture du jeune (ou la seconde réservation)
  échoue, le compteur est recalculé à partir des jeunes affectés. Un `$inc` inverse se croisait avec le recomptage de la
  requête gagnante : en test, 20 demandes sur une session de 20 places laissaient `placesLeft` à 27.

Après une écriture réussie, le recomptage existant (`updatePlacesSessionPhase1`, `updateSeatsTakenInBusLine`,
`updatePlacesBus`) est appelé sur le document **relu après réservation**. Il corrige le double comptage quand le jeune
confirme une ligne ou une session qu'il occupait déjà. L'ancienne ligne ou session n'est plus recomptée une seconde fois
quand c'est la même.

Dans l'affectation, un jeune déjà compté sur la ligne demandée (changement de point de rassemblement sur la même
ligne, `ModalChangePDRSameLine`) ne réserve pas de nouveau siège. Avant, ce changement était refusé dès que la ligne
était pleine.

## Vérification (Node 20, en série)

| Contrôle                                                                                                                                                                               | Résultat                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `api` — `lot-j-reservation-places` (nouveau)                                                                                                                                           | 13/13, plusieurs lancements ; sur le code d'`origin/main`, 6 cas échouent |
| `api` — suites voisines (sécurité jeune et référent-jeune, séjours/transport, plan de transport lot L1, éligibilité session, cohortes, lots L3/L4, anonymisation, `ligneDeBusService`) | 11 suites, 212/212 (1 todo)                                               |

Cas couverts : 20 affectations concurrentes sur la dernière place d'une session → 1 succès ; 20 affectations
concurrentes sur le dernier siège d'une ligne → 1 succès, compteurs de ligne et de session exacts ; `ligneId` seul → 400 ;
ligne qui ne dessert pas le point, ou d'une autre session → 400 ; ligne pleine → 409 ; nouvelle confirmation de la même
ligne → pas de siège en plus ; changement de point par l'admin sur la même ligne pleine → accepté, sans siège en plus ; 20 réservations concurrentes directes (siège de ligne, place de session) → 1 succès.

## Actions de déploiement

Aucune variable ni migration. Les réponses « plus de place » passent de 403/404 à 409 : le front moncompte et l'admin
affichent le code d'erreur, sans traitement particulier du statut.

## Hors périmètre / à surveiller

- **Fenêtre résiduelle.** Le recomptage fixe une valeur absolue à partir des jeunes déjà écrits. S'il s'exécute
  pendant qu'une autre requête a réservé sans avoir encore écrit son jeune (quelques millisecondes au point de
  rassemblement ; dans l'affectation, la durée de l'envoi de l'email Brevo, fait avant l'écriture), il efface cette réservation en attente. Une troisième requête concurrente
  pourrait alors prendre la même place. La fenêtre est bien plus courte qu'avant, mais pas nulle. La fermer
  complètement suppose de faire du compteur la seule source de vérité (`$inc` à chaque libération, plus de
  recomptage absolu dans ces routes), ce qui touche toutes les routes de changement de statut.
- Les autres recomptages (changement de statut dans `controllers/young/index.ts`, `referentController.ts`,
  `youngEditionController.ts`) ne réservent rien : ils libèrent ou réalignent des places, sans contrôle de capacité à
  contourner.
- La route legacy `/young/:id/meeting-point` n'a plus d'appelant dans les fronts ; elle pourrait être supprimée avec
  les modèles `MeetingPoint`/`Bus`.

/**
 * Réservation atomique des places (constat L25).
 *
 * Les routes d'affectation et de choix du point de rassemblement lisaient le compteur de places,
 * écrivaient le jeune puis recomptaient : deux requêtes concurrentes voyaient la même dernière
 * place libre et la prenaient toutes les deux. La réservation se fait désormais par une seule
 * écriture conditionnelle sur le compteur ; le jeune n'est écrit qu'en cas de succès, et le
 * recomptage habituel (`updatePlacesSessionPhase1`, `updateSeatsTakenInBusLine`, `updatePlacesBus`)
 * réaligne ensuite le compteur sur les jeunes réellement affectés.
 *
 * Les fonctions de réservation renvoient le document à jour (à passer au recomptage, qui compare
 * le compteur en mémoire à la base) ou `null` si plus aucune place n'est disponible.
 *
 * Quand l'écriture du jeune échoue après une réservation, le compteur est recalculé plutôt que
 * réincrémenté : un `$inc` inverse se croiserait avec le recomptage d'une requête concurrente et
 * ferait dériver le compteur au-delà de la capacité.
 */
import { ClientSession } from "mongoose";

import { BusModel, LigneBusModel, SessionPhase1Model } from "../models";
import { updatePlacesBus, updatePlacesSessionPhase1, updateSeatsTakenInBusLine } from "./index";

// `updateOne` plutôt que `findOneAndUpdate` : le hook post-findOneAndUpdate de mongoose-patch-history
// plante quand la condition ne correspond à aucun document (cas « plus de place »).

export async function reserveSessionPhase1Places(sessionId: string, count = 1, transaction?: ClientSession) {
  const { modifiedCount } = await SessionPhase1Model.updateOne({ _id: sessionId, placesLeft: { $gte: count } }, { $inc: { placesLeft: -count } }, { session: transaction });
  if (modifiedCount !== 1) return null;
  return SessionPhase1Model.findById(sessionId).session(transaction ?? null);
}

export async function resyncSessionPhase1Places(sessionId: string, fromUser) {
  const session = await SessionPhase1Model.findById(sessionId);
  if (session) await updatePlacesSessionPhase1(session, fromUser);
}

export async function reserveBusLineSeat(ligneId: string) {
  const { modifiedCount } = await LigneBusModel.updateOne({ _id: ligneId, $expr: { $lt: ["$youngSeatsTaken", "$youngCapacity"] } }, { $inc: { youngSeatsTaken: 1 } });
  if (modifiedCount !== 1) return null;
  return LigneBusModel.findById(ligneId);
}

export async function resyncBusLineSeats(ligneId: string) {
  const ligne = await LigneBusModel.findById(ligneId);
  if (ligne) await updateSeatsTakenInBusLine(ligne);
}

// Bus « legacy » (MeetingPoint / Bus), encore servi par /young/:id/meeting-point.
export async function reserveLegacyBusPlace(busId: string) {
  const { modifiedCount } = await BusModel.updateOne({ _id: busId, placesLeft: { $gt: 0 } }, { $inc: { placesLeft: -1 } });
  if (modifiedCount !== 1) return null;
  return BusModel.findById(busId);
}

export async function resyncLegacyBusPlaces(busId: string) {
  const bus = await BusModel.findById(busId);
  if (bus) await updatePlacesBus(bus);
}

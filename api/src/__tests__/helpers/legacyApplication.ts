import mongoose, { Types } from "mongoose";

import { ApplicationModel } from "../../models";

const { ObjectId } = Types;

/**
 * Une candidature telle qu'elle existait avant le marqueur `proposalNotAccepted` : insérée sans passer par
 * le modèle (donc sans le hook qui tient le marqueur), avec l'historique de statuts que le plugin
 * d'historique a écrit dans `application_patches` : un patch de création (opérations `add`, dont le
 * statut n'est pas la première), puis un patch `replace` par changement de statut.
 *
 * `history` est la suite des statuts de la candidature, du premier au statut courant (sauf `status`
 * explicite dans `fields`). `creationPatch: false` simule un historique dont le patch de création manque :
 * le premier statut ne se lit alors que dans la valeur d'origine du premier changement.
 */
export async function insertLegacyApplication(
  fields: Record<string, unknown>,
  history: string[],
  { creationPatch = true, reverseInsertion = false }: { creationPatch?: boolean; reverseInsertion?: boolean } = {},
) {
  const now = new Date();
  const { insertedId } = await ApplicationModel.collection.insertOne({
    ...fields,
    status: fields.status ?? history[history.length - 1],
    createdAt: now,
    updatedAt: now,
  });

  const start = Date.now() - 10 * 60 * 1000;
  const patches: Record<string, unknown>[] = [];
  history.forEach((status, index) => {
    const date = new Date(start + index * 1000);
    if (index === 0) {
      if (!creationPatch) return;
      patches.push({
        ref: insertedId,
        modelName: "application",
        date,
        __v: 0,
        ops: [
          { op: "add", path: "/missionDuration", value: "84" },
          { op: "add", path: "/status", value: status },
          { op: "add", path: "/priority", value: "1" },
        ],
      });
      return;
    }
    // Un patch qui ne touche pas au statut s'intercale : il ne doit rien changer à la lecture de l'historique.
    patches.push({
      ref: insertedId,
      modelName: "application",
      date: new Date(date.getTime() - 500),
      __v: 0,
      ops: [{ op: "replace", path: "/statusComment", value: "x", originalValue: "" }],
    });
    patches.push({ ref: insertedId, modelName: "application", date, __v: 0, ops: [{ op: "replace", path: "/status", value: status, originalValue: history[index - 1] }] });
  });

  if (patches.length) {
    await mongoose.connection.db.collection("application_patches").insertMany((reverseInsertion ? [...patches].reverse() : patches) as any);
  }
  return { _id: insertedId, youngId: fields.youngId, structureId: fields.structureId };
}

export const newLegacyFields = () => ({
  youngId: new ObjectId().toString(),
  missionId: new ObjectId().toString(),
  structureId: new ObjectId().toString(),
  tutorId: new ObjectId().toString(),
  missionDuration: "84",
});

import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../../young/young.service";
import ClasseModel from "../../models/cle/classe";
import YoungModel from "../../models/young";
import { YOUNG_STATUS } from "snu-lib";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};

export const deleteClasse = async (_id: string, fromUser: object) => {
  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.deletedAt) throw new Error("Classe already deleted");
  if (classe.cohesionCenterId) throw new Error("Classe already linked to a cohesion center");
  if (classe.sessionId) throw new Error("Classe already linked to a session");
  if (classe.ligneId) throw new Error("Classe already linked to a bus line");

  const students = await YoungModel.find({
    classeId: classe._id,
    status: { $in: [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.VALIDATED] },
  });

  const studentsValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);
  if (studentsValidated.length > 0) throw new Error("Classe has validated students");

  // Deelete classe
  classe.set({ deletedAt: Date.now() });
  classe = await classe.save({ fromUser });

  // Set all students in "Inscription abandonnée"
  await Promise.all(
    students.map((s) => {
      s.set({
        status: YOUNG_STATUS.ABANDONED,
        lastStatusAt: Date.now(),
        withdrawnMessage: "classe supprimée",
        withdrawnReason: "other",
      });
      return s.save({ fromUser });
    }),
  );

  return classe;
};

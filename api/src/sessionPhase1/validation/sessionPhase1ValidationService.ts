import { UserDto, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { YoungDocument } from "../../models";
import { isBefore, startOfDay } from "date-fns";

export async function updateStatusPhase1(young: YoungDocument, validationDate: string | Date, user: Partial<UserDto>): Promise<YoungDocument> {
  const { shouldValidate, message } = shouldValidatePhase1(young, validationDate);

  if (shouldValidate) {
    young.set({ statusPhase1: YOUNG_STATUS_PHASE1.DONE });
    if (!young.statusPhase2OpenedAt) young.set({ statusPhase2OpenedAt: new Date() });
  } else {
    const note = {
      note: `Phase 1 non validée pour la raison suivante : ${message}.`,
      phase: "PHASE_1",
      referent: user,
    };
    young.set({
      statusPhase1: YOUNG_STATUS_PHASE1.NOT_DONE,
      notes: young.notes ? [...young.notes, note] : [note],
      hasNotes: "true",
    });
  }

  return await young.save({ fromUser: user });
}

export function shouldValidatePhase1(young: YoungDocument, validationDate: Date | string): { shouldValidate: boolean; message?: string } {
  if (!young.cohesionStayPresence && !young.departSejourAt) {
    throw new Error(`La présence au séjour ou la date de départ n'est pas définie pour le jeune ${young._id}`);
  }
  if (young.cohesionStayPresence === "false") {
    return { shouldValidate: false, message: "Le volontaire a été pointé absent au séjour" };
  }
  if (young.departSejourMotif === "Exclusion") {
    return { shouldValidate: false, message: "Le volontaire a été exclu du séjour" };
  }
  if (young.departSejourAt && isBefore(young.departSejourAt, startOfDay(validationDate))) {
    return { shouldValidate: false, message: "Le volontaire est parti avant la date de validation" };
  }
  return { shouldValidate: true };
}

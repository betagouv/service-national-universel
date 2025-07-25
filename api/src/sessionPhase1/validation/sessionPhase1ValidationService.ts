import { UserDto, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { CohortModel, YoungDocument } from "../../models";
import { addingDayToDate } from "../../utils";
import { updateStatusPhase1WithOldRules, updateStatusPhase1WithSpecificCase } from "../../utils/old_cohorts_logic";
import { isBefore, isPast, isToday, startOfDay } from "date-fns";

export async function autoValidationSessionPhase1Young({ young, user }) {
  const youngCohort = await CohortModel.findOne({ name: young.cohort });
  if (!youngCohort) {
    throw new Error("Cohort not found");
  }
  let cohortWithOldRules = ["2021", "2022", "Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B"];

  const { daysToValidate: daysToValidate, validationDate: dateDeValidation, validationDateForTerminaleGrade: dateDeValidationTerminale, dateStart: dateStartCohort } = youngCohort;

  // Ici on regarde si la session à des date spécifique sinon on garde la date de la cohort
  const dateStart = youngCohort.dateStart;
  const isTerminale = young?.grade === "Terminale";
  // cette constante nous permet d'avoir la date de validation d'un séjour en fonction du grade d'un Young
  const validationDate = isTerminale ? dateDeValidationTerminale : dateDeValidation;
  const validationDateWithDays = await addingDayToDate(daysToValidate, dateStart);

  if (young.cohort === "Juin 2023") {
    await updateStatusPhase1WithSpecificCase(young, validationDate, user);
  } else if (cohortWithOldRules.includes(young.cohort)) {
    await updateStatusPhase1WithOldRules(young, validationDate, isTerminale, user);
  } else if (isToday(validationDateWithDays) || isPast(validationDateWithDays)) {
    await updateStatusPhase1(young, validationDateWithDays, user);
  }
  return { dateStart, daysToValidate, validationDateWithDays, dateStartCohort };
}

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

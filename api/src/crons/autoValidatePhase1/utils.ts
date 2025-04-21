import { addDays, isSameDay } from "date-fns";
import { CohortDocument } from "../../models";

export function isCohortValidationDateToday(cohort: CohortDocument, date: Date): boolean {
  const dateDebut = cohort.dateStart;
  const daysToValidate = cohort.daysToValidate || 8;
  const dateValidation = addDays(dateDebut, daysToValidate);
  return isSameDay(date, dateValidation);
}

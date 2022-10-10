import { COHESION_STAY_END } from "snu-lib";
import dayjs from "dayjs";
import "dayjs/locale/fr";

export function computeSejourDate(cohort) {
  if (cohort) {
    const startDate = COHESION_STAY_END[cohort];
    if (startDate) {
      const start = dayjs(startDate).locale("fr");
      const end = dayjs(start).locale("fr").add(12, "day");
      if (start.year() === end.year()) {
        if (start.month() === end.month()) {
          return start.format("D") + " au " + end.format("D MMMM YYYY");
        } else {
          return start.format("D MMMM") + " au " + end.format("D MMMM YYYY");
        }
      } else {
        return start.format("D MMMM YYYY") + " au " + end.format("D MMMM YYYY");
      }
    }
  }
  return null;
}

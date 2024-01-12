import { YOUNG_SCHOOLED_SITUATIONS, GRADES, translate, translateGrade } from "snu-lib";

export const getYoungSchooledSituationOptions = () =>
  Object.keys(YOUNG_SCHOOLED_SITUATIONS).map((situation) => ({
    value: YOUNG_SCHOOLED_SITUATIONS[situation],
    label: translate(situation),
  }));

export const getSchoolGradesOptions = () =>
  Object.keys(GRADES).map((grade) => ({
    value: GRADES[grade],
    label: translateGrade(grade),
  }));

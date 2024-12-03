import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { department2region, departmentList, InscriptionGoalType } from "snu-lib";

export default function getNewInscriptionGoalFixture(object: Partial<InscriptionGoalType> = {}): Partial<InscriptionGoalType> {
  const department = faker.helpers.arrayElement(departmentList);
  return {
    department,
    region: department2region[department],
    max: faker.number.int({ min: 11, max: 123 }),
    cohortId: new ObjectId().toString(),
    cohort: faker.helpers.arrayElement(["Février 2023 - C", "Février 2024 - A"]),
    ...object,
  };
}

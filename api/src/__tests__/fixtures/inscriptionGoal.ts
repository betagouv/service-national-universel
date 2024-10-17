import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { departmentList, InscriptionGoalType, regionList } from "snu-lib";

export default function getNewInscriptionGoalFixture(object: Partial<InscriptionGoalType> = {}): Partial<InscriptionGoalType> {
  return {
    region: faker.helpers.arrayElement(regionList),
    department: faker.helpers.arrayElement(departmentList),
    max: faker.number.int({ min: 11, max: 123 }),
    cohortId: new ObjectId().toString(),
    cohort: faker.lorem.words(),
    ...object,
  };
}

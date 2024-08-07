import { fakerFR as faker } from "@faker-js/faker";
import { InscriptionGoalType } from "../../models";

export default function getNewInscriptionGoalFixture(): Partial<InscriptionGoalType> {
  return {
    region: faker.lorem.words(),
    department: faker.number.int({ min: 11, max: 123 }).toString(),
    max: faker.number.int({ min: 11, max: 123 }),
    cohortId: "1",
  };
}

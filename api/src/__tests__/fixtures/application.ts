import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";

import { ApplicationType } from "snu-lib";

const { ObjectId } = Types;

function getNewApplicationFixture(): Partial<ApplicationType> {
  return {
    youngId: new ObjectId().toString(),
    youngFirstName: faker.person.firstName(),
    youngLastName: faker.person.lastName(),
    youngEmail: faker.internet.email(),
    youngBirthdateAt: faker.date.past().toISOString(),
    youngCity: faker.location.city(),
    youngDepartment: faker.location.city(),
    youngCohort: "2021",
    missionId: new ObjectId().toString(),
    missionName: faker.company.catchPhrase(),
    missionDepartment: faker.location.city(),
    missionRegion: faker.location.state(),
    structureId: new ObjectId().toString(),
    tutorId: new ObjectId().toString(),
    contractId: new ObjectId().toString(),
    tutorName: faker.person.firstName(),
    priority: "1",
    status: "WAITING_VALIDATION",
    cohortId: new ObjectId().toString(),
  };
}

export { getNewApplicationFixture };

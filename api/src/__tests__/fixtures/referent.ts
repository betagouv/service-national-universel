import { fakerFR as faker } from "@faker-js/faker";

import { ROLES } from "snu-lib";
import { ReferentType } from "../../models";

export function getNewReferentFixture(object: Partial<ReferentType> = {}): Partial<ReferentType> {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    region: faker.location.state(),
    department: [faker.location.state()],
    phone: faker.phone.number(),
    mobile: faker.phone.number(),
    role: ROLES.ADMIN,
    acceptCGU: "true",
    lastLoginAt: faker.date.past(),
    ...object,
  };
}

export function getReinscriptionSignupReferentFixture(object = {}) {
  return {
    ...getNewReferentFixture(),
    invitationToken: faker.string.uuid(),
    invitationExpires: faker.date.future(),
    ...object,
  };
}

export function getNewSignupReferentFixture(object = {}) {
  return {
    email: faker.internet.email().toLowerCase(),
    region: faker.location.state(),
    department: [faker.location.state()],
    mobile: faker.phone.number(),
    role: ROLES.ADMIN,
    acceptCGU: "true",
    invitationToken: faker.string.uuid(),
    invitationExpires: faker.date.future(),
    ...object,
  };
}

export default getNewReferentFixture;

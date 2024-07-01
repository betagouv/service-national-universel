import { fakerFR as faker } from "@faker-js/faker";

import { ROLES } from "snu-lib";

export function getNewReferentFixture(object = {}) {
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

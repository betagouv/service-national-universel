import { fakerFR as faker } from "@faker-js/faker";

import { ROLES, ReferentType, regionList } from "snu-lib";

// GOO-190 : faker.internet.email() ne garantit pas l'unicité entre deux appels
// (même dans le même run), ce qui provoquait une collision occasionnelle sur
// l'index unique `email` en base de test. Un compteur monotone par process
// rend chaque email unique, quel que soit le tirage de faker.
let emailSequence = 0;

function getUniqueEmail(): string {
  const [localPart, domain] = faker.internet.email().split("@");
  return `${localPart}.${emailSequence++}@${domain}`.toLowerCase();
}

export function getNewReferentFixture(object: Partial<ReferentType> = {}): Partial<ReferentType> {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: getUniqueEmail(),
    region: faker.helpers.arrayElement(regionList),
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
    email: getUniqueEmail(),
    region: faker.helpers.arrayElement(regionList),
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

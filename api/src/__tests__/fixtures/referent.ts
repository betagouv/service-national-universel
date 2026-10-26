import { fakerFR as faker } from "@faker-js/faker";

import { ROLES, ReferentType, regionList } from "snu-lib";

// GOO-190 : faker.internet.email() ne garantit pas l'unicité entre deux appels,
// ce qui provoquait une collision occasionnelle sur l'index unique `email` en
// base de test — y compris entre deux lancements successifs de la suite,
// puisque la base de test n'est jamais purgée entre deux runs locaux (seul
// `dbClose` déconnecte, sans `drop`). Un suffixe UUID donne une entropie
// suffisante pour rendre la collision négligeable dans tous les cas, selon le
// même principe déjà en place pour `young.email` (fixtures/young.ts:15).
function getUniqueEmail(): string {
  return faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.string.uuid() }).toLowerCase();
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

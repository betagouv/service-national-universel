const { fakerFR: faker } = require("@faker-js/faker");
const { ROLES } = require("snu-lib");

function getNewReferentFixture(object = {}) {
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

module.exports = getNewReferentFixture;

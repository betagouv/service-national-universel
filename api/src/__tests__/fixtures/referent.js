const { fakerFR: faker } = require("@faker-js/faker");
const { ROLES } = require("snu-lib");

function getNewReferentFixture() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    region: faker.location.state(),
    department: [faker.location.state()],
    phone: faker.phone.number(),
    mobile: faker.phone.number(),
    role: ROLES.ADMIN,
    acceptCGU: "true",
  };
}

module.exports = getNewReferentFixture;

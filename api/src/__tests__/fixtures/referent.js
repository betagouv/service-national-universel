const faker = require("faker");

faker.locale = "fr";

function getNewReferentFixture() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    region: faker.address.state(),
    department: faker.address.state(),
    phone: faker.phone.phoneNumber(),
    mobile: faker.phone.phoneNumber(),
    role: "admin",
  };
}

module.exports = getNewReferentFixture;

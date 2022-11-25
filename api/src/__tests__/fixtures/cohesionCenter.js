const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewCohesionCenterFixture() {
  const placesLeft = 15;
  return {
    name: faker.lorem.word(),
    code2022: faker.lorem.word(),
    address: faker.lorem.word(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    department: faker.address.state(),
    region: faker.address.state(),
    addressVerified: faker.boolean(),
    placesTotal: placesLeft,
    pmr: faker.boolean(),
    academy: faker.address.city(),
    typology: "PUBLIC_ETAT",
    domain: "ETABLISSEMENT",
    complement: faker.lorem.word(),
    centerDesignation: faker.lorem.word(),
    placesSession: placesLeft,
    cohort: "Février 2023 - C",
    statusSession: "VALIDATED",
  };
}

module.exports = {
  getNewCohesionCenterFixture,
};

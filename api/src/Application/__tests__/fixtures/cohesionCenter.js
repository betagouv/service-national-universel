const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewCohesionCenterFixture() {
  const placesLeft = 15;
  return {
    name: faker.lorem.word(),
    code: faker.lorem.word(),
    departmentCode: "55",
    address: faker.lorem.word(),
    zip: faker.address.zipCode(),
    city: faker.address.city(),
    department: faker.address.state(),
    region: faker.address.state(),
    country: faker.address.country(),
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    outfitDelivered: faker.lorem.word(),
    observations: faker.lorem.word(),
    waitingList: [faker.lorem.word(), faker.lorem.word()],
    COR: faker.lorem.word(),
    cohorts: ["2020"],
    2020: {
      status: "VALIDATED",
      placesLeft: placesLeft,
      placesTotal: placesLeft,
    },
  };
}

function getNewCohesionCenterFixtureV2() {
  return {
    name: faker.lorem.word(),
    code2022: faker.lorem.word(),
    address: faker.lorem.word(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    department: faker.address.state(),
    region: faker.address.state(),
    addressVerified: true,
    placesTotal: "20",
    pmr: false,
    academy: faker.address.city(),
    typology: "PUBLIC_ETAT",
    domain: "ETABLISSEMENT",
    complement: faker.lorem.word(),
    centerDesignation: faker.lorem.word(),
    placesSession: "10",
    cohort: "Février 2023 - C",
    statusSession: "VALIDATED",
  };
}

module.exports = {
  getNewCohesionCenterFixture,
  getNewCohesionCenterFixtureV2,
};

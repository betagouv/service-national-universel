const { fakerFR: faker } = require("@faker-js/faker");

function getNewPointDeRassemblementFixture() {
  return {
    code: faker.lorem.words(),
    cohorts: ["Février 2023 - C"],
    name: faker.name.findName(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.location.state(),
    region: faker.location.state(),
    country: faker.location.country(),
    location: {
      lat: Number(faker.location.latitude()),
      lon: Number(faker.location.longitude()),
    },
  };
}

module.exports = getNewPointDeRassemblementFixture;

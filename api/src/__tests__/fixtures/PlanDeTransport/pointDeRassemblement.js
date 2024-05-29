const { faker } = require("@faker-js/faker");
faker.locale = "fr";

function getNewPointDeRassemblementFixture(object = {}) {
  return {
    code: faker.lorem.words(),
    cohorts: ["Février 2023 - C"],
    name: faker.name.findName(),
    address: faker.address.streetAddress(),
    zip: faker.address.zipCode(),
    city: faker.address.city(),
    department: faker.address.state(),
    region: faker.address.state(),
    country: faker.address.country(),
    location: {
      lat: Number(faker.address.latitude()),
      lon: Number(faker.address.longitude()),
    },
    ...object,
  };
}

module.exports = getNewPointDeRassemblementFixture;

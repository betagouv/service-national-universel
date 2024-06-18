const { fakerFR: faker } = require("@faker-js/faker");

function getNewStructureFixture() {
  return {
    name: faker.name.findName(),
    siret: faker.datatype.number().toString(),
    description: faker.lorem.sentences(),
    website: faker.internet.url(),
    facebook: faker.internet.url(),
    twitter: faker.internet.url(),
    instagram: faker.internet.url(),
    status: "WAITING_VALIDATION",
    isNetwork: "true",
    networkId: "",
    networkName: faker.name.findName(),
    legalStatus: "ASSOCIATION",
    associationTypes: [],
    structurePubliqueType: faker.lorem.sentences(),
    structurePubliqueEtatType: faker.lorem.sentences(),
    structurePriveeType: faker.lorem.sentences(),
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
    state: faker.location.state(),
    isMilitaryPreparation: "false",
  };
}

module.exports = getNewStructureFixture;

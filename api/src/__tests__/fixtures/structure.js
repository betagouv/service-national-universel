const faker = require("faker");

faker.locale = "fr";

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
    state: faker.address.state(),
    isMilitaryPreparation: "false",
  };
}

module.exports = getNewStructureFixture;

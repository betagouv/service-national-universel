const faker = require("faker");

faker.locale = "fr";

function getNewMissionFixture() {
  return {
    name: faker.name.findName(),
    domains: [],
    startAt: faker.date.past(),
    endAt: faker.date.past(),
    format: "CONTINUOUS",
    frequence: "",
    period: [],
    subPeriod: [],
    placesTotal: faker.datatype.number(),
    placesLeft: faker.datatype.number(),
    actions: faker.lorem.sentences(),
    description: faker.lorem.sentences(),
    justifications: faker.lorem.sentences(),
    contraintes: faker.lorem.sentences(),
    structureId: "",
    structureName: faker.name.findName(),
    status: "DRAFT",
    tutorId: "",
    tutorName: "",
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
    remote: faker.lorem.sentences(),
  };
}

module.exports = getNewMissionFixture;

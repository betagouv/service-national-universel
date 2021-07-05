const faker = require("faker");

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
    waitingList: faker.lorem.word(),
    COR: faker.lorem.word(),
  };
}

module.exports = {
  getNewCohesionCenterFixture,
};

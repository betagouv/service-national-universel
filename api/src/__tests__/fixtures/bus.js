const faker = require("faker");

faker.locale = "fr";

function getNewBusFixture() {
  return {
    idExcel: faker.lorem.words(),
    capacity: faker.random.number({ min: 11, max: 20 }),
    placesLeft: faker.random.number({ min: 1, max: 10 }),
  };
}

module.exports = getNewBusFixture;

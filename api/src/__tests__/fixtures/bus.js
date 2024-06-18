const { fakerFR: faker } = require("@faker-js/faker");

function getNewBusFixture() {
  return {
    idExcel: faker.lorem.words(),
    capacity: faker.datatype.number({ min: 11, max: 20 }),
    placesLeft: faker.datatype.number({ min: 1, max: 10 }),
  };
}

module.exports = getNewBusFixture;

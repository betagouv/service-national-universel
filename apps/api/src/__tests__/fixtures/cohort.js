const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewBusFixture() {
  return {
    snuId: faker.lorem.words(),
    dateStart: faker.date.past(),
    dateEnd: faker.date.past(),
  };
}

module.exports = getNewBusFixture;

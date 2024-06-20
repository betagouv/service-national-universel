const { fakerFR: faker } = require("@faker-js/faker");

function getNewInscriptionGoalFixture() {
  return {
    region: faker.lorem.words(),
    department: faker.number.int({ min: 11, max: 123 }),
    max: faker.number.int({ min: 11, max: 123 }),
  };
}

module.exports = getNewInscriptionGoalFixture;

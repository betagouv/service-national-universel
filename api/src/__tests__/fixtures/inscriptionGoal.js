const faker = require("faker");

faker.locale = "fr";

function getNewInscriptionGoalFixture() {
  return {
    region: faker.lorem.words(),
    department: faker.datatype.number({ min: 11, max: 123 }),
    max: faker.datatype.number({ min: 11, max: 123 }),
  };
}

module.exports = getNewInscriptionGoalFixture;

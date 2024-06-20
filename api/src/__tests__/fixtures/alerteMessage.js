const { fakerFR: faker } = require("@faker-js/faker");
const { ROLES_LIST } = require("snu-lib");

function getNewAlerteMessageFixture(object = {}) {
  return {
    content: "Test message",
    priority: faker.helpers.arrayElement(["normal", "important", "urgent"]),
    to_role: faker.helpers.arrayElements(ROLES_LIST),
    ...object,
  };
}

module.exports = getNewAlerteMessageFixture;

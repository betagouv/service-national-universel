const { fakerFR: faker } = require("@faker-js/faker");
const { ROLES_LIST } = require("snu-lib");

function getNewAlerteMessageFixture(object = {}) {
  return {
    content: "Message d'importance normale à caractère informatif (annonces sans besoin d'action de votre part) https://www.snu.gouv.fr/",
    priority: faker.helpers.arrayElement(["normal", "important", "urgent"]),
    to_role: faker.helpers.arrayElements(ROLES_LIST),
    ...object,
  };
}

module.exports = getNewAlerteMessageFixture;

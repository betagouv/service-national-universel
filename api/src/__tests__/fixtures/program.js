const { fakerFR: faker } = require("@faker-js/faker");

function getNewProgramFixture() {
  return {
    name: faker.name.findName(),
    description: faker.lorem.sentences(),
    descriptionFor: faker.lorem.sentences(),
    descriptionMoney: faker.lorem.sentences(),
    descriptionDuration: faker.lorem.sentences(),
    url: faker.internet.url(),
    imageFile: "",
    imageString: "",
    type: faker.lorem.sentences(),
    department: faker.location.state(),
    region: faker.location.state(),
    visibility: "",
  };
}

module.exports = getNewProgramFixture;

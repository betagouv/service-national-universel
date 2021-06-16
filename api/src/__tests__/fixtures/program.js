const faker = require("faker");

faker.locale = "fr";

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
    department: faker.address.state(),
    region: faker.address.state(),
    visibility: "",
  };
}

module.exports = getNewProgramFixture;

const faker = require("faker");

faker.locale = "fr";

function getNewDepartmentServiceFixture() {
  return {
    department: faker.address.state(),
    region: faker.address.state(),
    directionName: faker.name.findName(),
    serviceName: faker.name.findName(),
    serviceNumber: faker.datatype.number().toString(),
    address: faker.address.streetAddress(),
    complementAddress: faker.address.streetAddress(),
    zip: faker.address.zipCode(),
    city: faker.address.city(),
    description: faker.lorem.sentences(),
  };
}

module.exports = getNewDepartmentServiceFixture;

const { fakerFR: faker } = require("@faker-js/faker");

function getNewDepartmentServiceFixture() {
  return {
    department: faker.location.state(),
    region: faker.location.state(),
    directionName: faker.company.name(),
    serviceName: faker.company.name(),
    serviceNumber: faker.datatype.number().toString(),
    address: faker.location.streetAddress(),
    complementAddress: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    description: faker.lorem.sentences(),
  };
}

module.exports = getNewDepartmentServiceFixture;

const faker = require("faker");
const { ObjectId } = require("mongoose").Types;
faker.locale = "fr";

function getNewApplicationFixture() {
  return {
    sqlId: faker.random.uuid(),
    youngId: ObjectId(),
    youngFirstName: faker.name.firstName(),
    youngLastName: faker.name.lastName(),
    youngEmail: faker.internet.email(),
    youngBirthdateAt: faker.date.past(),
    youngCity: faker.address.city(),
    youngDepartment: faker.address.city(),
    youngCohort: "2021",
    missionId: ObjectId(),
    missionName: faker.company.catchPhrase(),
    missionDepartment: faker.address.city(),
    missionRegion: faker.address.state(),
    structureId: ObjectId(),
    tutorId: ObjectId(),
    contractId: ObjectId(),
    tutorName: faker.name.firstName(),
    priority: "1",
    status: "WAITING_VALIDATION",
  };
}

module.exports = {
  getNewApplicationFixture,
};

const { fakerFR: faker } = require("@faker-js/faker");
const { ObjectId } = require("mongoose").Types;

function getNewApplicationFixture() {
  return {
    sqlId: faker.datatype.uuid(),
    youngId: ObjectId(),
    youngFirstName: faker.person.firstName(),
    youngLastName: faker.person.lastName(),
    youngEmail: faker.internet.email(),
    youngBirthdateAt: faker.date.past(),
    youngCity: faker.location.city(),
    youngDepartment: faker.location.city(),
    youngCohort: "2021",
    missionId: ObjectId(),
    missionName: faker.company.catchPhrase(),
    missionDepartment: faker.location.city(),
    missionRegion: faker.location.state(),
    structureId: ObjectId(),
    tutorId: ObjectId(),
    contractId: ObjectId(),
    tutorName: faker.person.firstName(),
    priority: "1",
    status: "WAITING_VALIDATION",
  };
}

module.exports = {
  getNewApplicationFixture,
};

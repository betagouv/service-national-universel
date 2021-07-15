const faker = require("faker");
const { ObjectId } = require("mongoose").Types;

faker.locale = "fr";

function getNewMeetingPointFixture() {
  return {
    busId: ObjectId(),
    busExcelId: faker.lorem.words(),
    centerId: faker.lorem.words(),
    centerCode: faker.lorem.words(),
    departureAddress: faker.lorem.words(),
    departureZip: faker.lorem.words(),
    departureCity: faker.lorem.words(),
    departureDepartment: faker.lorem.words(),
    departureRegion: faker.lorem.words(),
    departureAt: faker.date.past(),
    departureAtString: faker.lorem.words(),
    returnAt: faker.date.past(),
    returnAtString: faker.lorem.words(),
  };
}

module.exports = getNewMeetingPointFixture;

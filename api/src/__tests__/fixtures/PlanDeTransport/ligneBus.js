const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewLigneBusFixture() {
  return {
    busId: faker.lorem.words(),
    youngCapacity: faker.datatype.number({ min: 11, max: 20 }),
    youngSeatsTaken: faker.datatype.number({ min: 1, max: 10 }),
    centerDepartureTime: "10:00",
    centerArrivalTime: "16:00",
    travelTime: faker.datatype.number({ min: 1, max: 4 }),
    followerCapacity: faker.datatype.number({ min: 1, max: 10 }),
    totalCapacity: faker.datatype.number({ min: 31, max: 40 }),
    returnDate: faker.date.past(),
    departuredDate: faker.date.past(),
  };
}

module.exports = getNewLigneBusFixture;

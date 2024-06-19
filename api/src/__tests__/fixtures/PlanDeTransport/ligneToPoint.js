const { fakerFR: faker } = require("@faker-js/faker");

function getNewLigneToPointFixture() {
  return {
    busArrivalHour: "16:00",
    departureHour: "11:00",
    meetingHour: "10:00",
    returnHour: "17:00",
    transportType: faker.helpers.arrayElement(["train", "bus", "fusée", "avion"]),
  };
}

module.exports = getNewLigneToPointFixture;

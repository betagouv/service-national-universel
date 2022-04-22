const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewSessionPhase1Fixture() {
  const placesLeft = 15;
  return {
    cohort: "2021",
    placesTotal: placesLeft,
    placesLeft: placesLeft,
  };
}

module.exports = {
  getNewSessionPhase1Fixture,
};

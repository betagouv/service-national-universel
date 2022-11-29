const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewSessionPhase1Fixture() {
  const placesLeft = 15;
  return {
    cohort: "2021",
    department: "Yvelines",
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    status: "VALIDATED",
  };
}

module.exports = {
  getNewSessionPhase1Fixture,
};

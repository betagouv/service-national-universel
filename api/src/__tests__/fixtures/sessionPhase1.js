const { fakerFR: faker } = require("@faker-js/faker");

function getNewSessionPhase1Fixture(object = {}) {
  const placesLeft = 15;
  return {
    cohort: "2021",
    department: "Yvelines",
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    status: "VALIDATED",
    ...object,
  };
}

module.exports = {
  getNewSessionPhase1Fixture,
};

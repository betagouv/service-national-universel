const { CohortModel } = require("../src/models");

module.exports = {
  async up() {
    await CohortModel.updateMany({ daysToValidate: null }, { $set: { daysToValidate: 8 } });
  },
};

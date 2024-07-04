const ClasseModel = require("../models/cle/classe");
const { STATUS_CLASSE } = require("snu-lib");
module.exports = {
  async up() {
    await ClasseModel.updateMany({ status: { $ne: STATUS_CLASSE.WITHDRAWN } }, { $set: { status: STATUS_CLASSE.CLOSED } });
  },
};

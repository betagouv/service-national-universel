const ClasseModel = require("../src/models/cle/classe");
module.exports = {
  async up() {
    await ClasseModel.updateMany({ region: "Ile-de-France" }, { $set: { region: "Île-de-France" } });
  },
};

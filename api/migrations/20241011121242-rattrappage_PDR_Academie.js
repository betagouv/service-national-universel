const { PointDeRassemblementModel } = require("../src/models");
const { departmentToAcademy } = require("snu-lib");
const { logger } = require("../src/logger");

module.exports = {
  async up(db, client) {
    const PointDeRassemblements = await PointDeRassemblementModel.find({ academie: { $exists: false } });
    for (const pointDeRassemblement of PointDeRassemblements) {
      let academie = departmentToAcademy[pointDeRassemblement.department];
      if (!academie) {
        logger.error(`No academy found for department ${pointDeRassemblement.department}`);
        academie = "NO_ACADEMY";
        continue;
      }
      pointDeRassemblement.set({ academie });
      await pointDeRassemblement.save({ fromUser: { firstName: "Migration mapper department to academy for pointDeRassemblement" } });
    }
  },
};

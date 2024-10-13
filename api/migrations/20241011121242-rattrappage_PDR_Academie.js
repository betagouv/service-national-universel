const { PointDeRassemblementModel, PlanTransportModel } = require("../src/models");
const { departmentToAcademy } = require("snu-lib");
const { logger } = require("../src/logger");

module.exports = {
  async up(db, client) {
    const pointDeRassemblements = await PointDeRassemblementModel.find({ academie: { $exists: false } });
    for (const pointDeRassemblement of pointDeRassemblements) {
      let academie = departmentToAcademy[pointDeRassemblement.department];
      if (!academie) {
        logger.error(`No academy found for department ${pointDeRassemblement.department}`);
        academie = "NO_ACADEMY";
        continue;
      }
      pointDeRassemblement.set({ academie });
      await pointDeRassemblement.save({ fromUser: { firstName: "Migration mapper department to academy for pointDeRassemblement" } });
    }

    const planDeTransports = await PlanTransportModel.find({ cohort: "Toussaint 2024" });
    for (const planDeTransport of planDeTransports) {
      const pointDeRassemblements = planDeTransport.pointDeRassemblements;
      for (const pointDeRassemblement of pointDeRassemblements) {
        let academie = departmentToAcademy[pointDeRassemblement.department];
        if (!academie) {
          logger.error(`No academy found for department ${pointDeRassemblement.department}`);
          academie = "NO_ACADEMY";
          continue;
        }
        pointDeRassemblement.academie = academie;
      }
      await planDeTransport.save({ fromUser: { firstName: "Migration mapper department to academy for pointDeRassemblement in planDeTransport" } });
    }
  },
};

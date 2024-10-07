const { CohesionCenterModel } = require("../src/models");
const { mapAcademy, mapDepartment } = require("../src/cohesionCenter/import/cohesionCenterImportMapper");

module.exports = {
  async up() {
    const centers = await CohesionCenterModel.find({ matricule: { $exists: true } });
    for (const center of centers) {
      const academy = mapAcademy(center.academy);
      const department = mapDepartment(center.department);
      center.set({ academy, department });
      await center.save({ fromUser: { firstName: "Migration mapper department&academy for center" } });
    }
  },
};

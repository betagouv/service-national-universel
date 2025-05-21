const { logger } = require("../src/logger");
const { LigneToPointModel } = require("../src/models/PlanDeTransport/ligneToPoint");
module.exports = {
  async up() {
    const lignesToPoint = await LigneToPointModel.find({
      lineId: { $in: ["67ed4e8c322e805767af2097", "67ed4e8c322e805767af2104", "67ed4e8d322e805767af2120"] },
    });

    for (const ligneToPoint of lignesToPoint) {
      ligneToPoint.stepPoints = ligneToPoint.stepPoints.map((stepPoint) => {
        stepPoint.address = "Gare de Chaumont";
        return stepPoint;
      });
      logger.info(`Ligne ${ligneToPoint._id} updated with new address ${ligneToPoint.stepPoints.map((stepPoint) => stepPoint.address).join(", ")}`);
      await ligneToPoint.save({ fromUser: { firstName: "775-changement-pdr-intermédiaire", lastName: "" } });
    }
  },

  async down() {
    const lignesToPoint = await LigneToPointModel.find({
      lineId: { $in: ["67ed4e8c322e805767af2097", "67ed4e8c322e805767af2104", "67ed4e8d322e805767af2120"] },
    });

    for (const ligneToPoint of lignesToPoint) {
      ligneToPoint.stepPoints = ligneToPoint.stepPoints.map((stepPoint) => {
        stepPoint.address = "Champagne Ardennes TGV";
        return stepPoint;
      });
      logger.info(`Ligne ${ligneToPoint._id} updated with new address ${ligneToPoint.stepPoints.map((stepPoint) => stepPoint.address).join(", ")}`);
      await ligneToPoint.save({ fromUser: { firstName: "revert-775-changement-pdr-intermédiaire", lastName: "" } });
    }
  },
};

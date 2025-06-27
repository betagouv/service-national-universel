const { logger } = require("../src/logger");
const { LigneToPointModel } = require("../src/models/PlanDeTransport/ligneToPoint");

const lineIds = ["6818872086c0277ba168afae"];

module.exports = {
  async up() {
    const lignesToPoint = await LigneToPointModel.find({
      lineId: { $in: lineIds },
    });

    for (const ligneToPoint of lignesToPoint) {
      ligneToPoint.stepPoints = ligneToPoint.stepPoints.map((stepPoint) => {
        stepPoint.address = "Gare de Pau";
        return stepPoint;
      });
      logger.info(`Ligne ${ligneToPoint._id} updated with new address ${ligneToPoint.stepPoints.map((stepPoint) => stepPoint.address).join(", ")}`);
      await ligneToPoint.save({ fromUser: { firstName: "927-changement-correspondance", lastName: "" } });
    }
  },

  async down() {
    const lignesToPoint = await LigneToPointModel.find({
      lineId: { $in: lineIds },
    });

    for (const ligneToPoint of lignesToPoint) {
      ligneToPoint.stepPoints = ligneToPoint.stepPoints.map((stepPoint) => {
        stepPoint.address = "Gare de Brive";
        return stepPoint;
      });
      logger.info(`Ligne ${ligneToPoint._id} updated with new address ${ligneToPoint.stepPoints.map((stepPoint) => stepPoint.address).join(", ")}`);
      await ligneToPoint.save({ fromUser: { firstName: "revert-927-changement-correspondance", lastName: "" } });
    }
  },
};

const ApplicationObject = require("./applicationModel");
const countByMissionIdAndStatusIn = (missionId, applicationStatus) =>
  ApplicationObject.countDocuments({
    missionId: missionId,
    status: { $in: applicationStatus },
  });

module.exports = {
  countByMissionIdAndStatusIn,
};

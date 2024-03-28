const MissionObject = require("../../models/mission");
const { countByMissionIdAndStatusIn } = require("../../infra/application/applicationRepository");
const ApplicationObject = require("../../infra/application/applicationModel");
const { capture } = require("../../sentry");
const { applicationStatusEnum } = require("../application/applicationStatusEnum");

async function updateMission(app, fromUser) {
  try {
    const mission = await MissionObject.findById(app.missionId);

    // Get all applications for the mission
    const placesTaken = await countByMissionIdAndStatusIn(mission._id, [applicationStatusEnum.VALIDATED, applicationStatusEnum.IN_PROGRESS, applicationStatusEnum.DONE]);
    const placesLeft = Math.max(0, mission.placesTotal - placesTaken);
    if (mission.placesLeft !== placesLeft) {
      mission.set({ placesLeft });
    }

    if (placesLeft === 0) {
      mission.set({ placesStatus: "FULL" });
    } else if (placesLeft === mission.placesTotal) {
      mission.set({ placesStatus: "EMPTY" });
    } else {
      mission.set({ placesStatus: "ONE_OR_MORE" });
    }

    // On met à jour le nb de candidatures en attente.
    const pendingApplications = await countByMissionIdAndStatusIn(mission._id, [applicationStatusEnum.WAITING_VERIFICATION, applicationStatusEnum.WAITING_VALIDATION]);
    if (mission.pendingApplications !== pendingApplications) {
      mission.set({ pendingApplications });
    }

    const allApplications = await ApplicationObject.find({ missionId: mission._id });
    mission.set({ applicationStatus: allApplications.map((e) => e.status) });

    await mission.save({ fromUser });
  } catch (e) {
    capture(e);
  }
}

module.exports = {
  updateMission,
};

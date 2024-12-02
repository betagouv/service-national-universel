import { fetchMissions } from "./JeVeuxAiderRepository";

const { capture } = require("../sentry");
const { config } = require("../config");
const slack = require("../slack");
const { synchronizeMission, cancelMission, fetchMissionsToCancel } = require("./JeVeuxAiderService");

let startTime = new Date();

const sync = async () => {
  let total;
  let count = 0;
  let skip = 0;

  do {
    const result = await fetchMissions(skip);
    if (!result.ok) throw new Error("sync with JVA missions : " + result.code);
    total = result.total;

    // Do not parallelize because of shared structures and users.
    for (const mission of result.data) {
      try {
        await synchronizeMission(mission);
      } catch (e) {
        capture(e);
      }
    }

    count += result.data.length;
    skip += 50;
  } while (count < total);

  await cleanData();
};

async function cleanData() {
  slack.info({ title: "sync with JVA missions", text: "I'm cleaning the outdated JVA missions !" });
  try {
    const missionsToCancel = await fetchMissionsToCancel(startTime);
    for (const mission of missionsToCancel) await cancelMission(mission);
    await slack.success({ title: "sync with JVA missions" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with JVA missions", text: "Error while deleting outdated missions !" });
  }
}

exports.handler = async () => {
  slack.info({ title: "sync with JVA missions", text: "I'm starting the synchronization !" });
  if (!config.JVA_API_KEY) {
    slack.error({ title: "sync with JVA missions", text: "I do not have any JVA_API_KEY !" });
    const err = new Error("NO JVA_API_KEY");
    capture(err);
    throw err;
  }
  if (!config.API_ENGAGEMENT_KEY) {
    slack.error({ title: "sync with API-ENGAGEMENT missions", text: "I do not have any API_ENGAGEMENT_KEY !" });
    const err = new Error("NO API_ENGAGEMENT_KEY");
    capture(err);
    throw err;
  }
  try {
    await sync();
  } catch (e) {
    capture(e);
    throw e;
  }
};

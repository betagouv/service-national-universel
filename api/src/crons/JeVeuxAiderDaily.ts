import { capture } from "../sentry";
import { config } from "../config";
import slack from "../slack";
import { fetchMissions } from "./JeVeuxAiderRepository";
import { cancelMission, fetchMissionsToCancel, syncMission } from "./JeVeuxAiderService";
import { logger } from "../logger";

let startTime = new Date();

const run = async () => {
  let total: number;
  let count = 0;
  let skip = 0;

  do {
    logger.info(`Fetching missions from ${skip} to ${skip + 50}`);
    const result = await fetchMissions(skip);
    if (!result.ok) throw new Error("sync with JVA missions : " + result.code);
    total = result.total;

    // Do not parallelize because of shared structures and referents.
    for (const mission of result.data) {
      try {
        await syncMission(mission);
      } catch (e) {
        capture(e);
      }
    }

    count += result.data.length;
    skip += 50;
  } while (count < total);
  logger.info(`Sync done`);

  logger.info(`Cleaning outdated missions`);
  await cleanData();
};

async function cleanData() {
  slack.info({ title: "sync with JVA missions", text: "I'm cleaning the outdated JVA missions !" });
  try {
    const missionsToCancel = await fetchMissionsToCancel(startTime);
    const cancelMissionPromises = missionsToCancel.map((mission) => cancelMission(mission));
    await Promise.all(cancelMissionPromises);
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
    await run();
  } catch (e) {
    capture(e);
    throw e;
  }
};

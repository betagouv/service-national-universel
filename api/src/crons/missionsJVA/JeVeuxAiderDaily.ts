import { capture } from "../../sentry";
import { config } from "../../config";
import slack from "../../slack";
import { cancelOldMissions, syncMissions } from "./JVAService";
import { logger } from "../../logger";

const run = async () => {
  let startTime = new Date();

  logger.info(`Sync started`);
  await syncMissions();
  logger.info(`Sync done`);

  logger.info(`Cleaning outdated missions`);
  slack.info({ title: "sync with JVA missions", text: "I'm cleaning the outdated JVA missions !" });
  try {
    // TODO: US-489 - Revoir les RG => l'annulation des missions est problèmatique
    // await cancelOldMissions(startTime);
    await slack.success({ title: "sync with JVA missions", text: "Annulation retirée temporairement" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with JVA missions", text: "Error while deleting outdated missions !" });
  }
};

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

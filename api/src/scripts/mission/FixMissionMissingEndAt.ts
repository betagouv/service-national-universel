import { capture } from "../../sentry";
import { logger } from "../../logger";
import { MissionDocument, MissionModel } from "../../models";
import { fetchMissions, JeVeuxAiderMission } from "../../crons/missionsJVA/JVARepository";
import { MISSION_STATUS } from "snu-lib";
import { endOfYear } from "date-fns";

const scriptUser = { firstName: "983 Fix JVAMissions endAt" };

function isJvaMissionWithoutEndDate(mission: JeVeuxAiderMission): boolean {
  return !mission.endAt || mission.endAt === "";
}

async function getPreviousStatusBeforeArchive(mission: MissionDocument): Promise<string | undefined> {
  try {
    const missionWithPatches: any = mission as any;
    if (!missionWithPatches.patches?.find) return undefined;

    const patches = await missionWithPatches.patches.find({ ref: mission._id }).sort({ date: 1 });

    const statusTimeline: string[] = [];
    for (const patch of patches) {
      for (const op of patch.ops || []) {
        const path: string = op.path || "";
        if (path.split("/")[1] === "status") {
          statusTimeline.push(op.value);
        }
      }
    }

    if (!statusTimeline.length) return undefined;

    for (let i = statusTimeline.length - 1; i >= 0; i--) {
      if (statusTimeline[i] === MISSION_STATUS.ARCHIVED) {
        const previous = statusTimeline[i - 1];
        if (previous && previous !== MISSION_STATUS.ARCHIVED) return previous;
      }
    }
    return undefined;
  } catch (e) {
    capture(e);
    return undefined;
  }
}

function getTargetEndAt(): Date {
  return endOfYear(new Date(2026, 1, 1));
}

async function processJvaMission(jva: JeVeuxAiderMission): Promise<void> {
  try {
    const jvaMissionId = parseInt(jva.clientId, 10);
    const mission = await MissionModel.findOne({ jvaMissionId });
    if (!mission) return;

    const updates: Partial<MissionDocument> = {} as any;

    updates.endAt = getTargetEndAt();
    logger.info(`Updating mission ${jvaMissionId} - ${mission.id} with endAt ${updates.endAt}`);

    if (mission.status === MISSION_STATUS.ARCHIVED) {
      const previousStatus = await getPreviousStatusBeforeArchive(mission);
      if (previousStatus) {
        (updates as any).status = previousStatus;
        logger.info(`Updating mission ${jvaMissionId} - ${mission.id} with status ${previousStatus}`);
      } else {
        logger.warn(`No previous status found before ARCHIVED for mission ${mission._id}`);
      }
    }

    mission.set(updates);
    await mission.save({ fromUser: scriptUser });
  } catch (e) {
    capture(e);
    throw e;
  }
}

export const handler = async (): Promise<void> => {
  logger.info("Starting JVAMissions endAt fix (set to 31/12/2026) for missions without end date on JVA");

  let processed = 0;
  let matched = 0;
  let total = 0;
  let skip = 0;

  try {
    do {
      const result = await fetchMissions(skip);
      if (!result?.ok) throw new Error("API Engagement fetch failed: " + result?.code);
      total = result.total;

      const jvaMissions = result.data.filter((m) => isJvaMissionWithoutEndDate(m) && !m.deleted);
      for (const m of jvaMissions) {
        matched += 1;
        await processJvaMission(m);
        processed += 1;
      }

      skip += 50;
    } while (skip < total);

    logger.info(`JVAMissions endAt fix done. Missions matched: ${matched}, Missions updated: ${processed}`);
  } catch (e) {
    capture(e);
    logger.error(e);
    throw e;
  }
};

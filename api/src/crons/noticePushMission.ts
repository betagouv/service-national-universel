import path from "path";

import { SENDINBLUE_TEMPLATES, translate, formatStringDate, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE1, YOUNG_STATUS, APPLICATION_STATUS, MISSION_STATUS } from "snu-lib";

import { capture } from "../sentry";
import { YoungModel, CohortModel, YoungDocument } from "../models";
import { sendTemplate } from "../brevo";
import slack from "../slack";
import { config } from "../config";
import { getCcOfYoung } from "../utils";
import esClient from "../es";

const fileName = path.basename(__filename, ".ts");

interface EsMission {
  _id: string;
  _source: {
    structureName?: string;
    name: string;
    startAt: string;
    endAt: string;
    city: string;
    zip: string;
    domains?: string[];
  };
}

export const handler = async (): Promise<void> => {
  try {
    let countTotal = 0;
    let countHit = 0;
    let countMissionSent = {};
    let countMissionSentCohort = {};

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const cohorts = await CohortModel.find({ dateEnd: { $gte: oneYearAgo } });
    const cohortsName = cohorts.map((s) => s.name);

    const cursor = YoungModel.find({
      cohort: { $in: cohortsName },
      status: YOUNG_STATUS.VALIDATED,
      statusPhase1: YOUNG_STATUS_PHASE1.DONE,
      statusPhase2: { $nin: [YOUNG_STATUS_PHASE2.VALIDATED, YOUNG_STATUS_PHASE2.WITHDRAWN, YOUNG_STATUS_PHASE2.DESENGAGED] },
    }).cursor();
    await cursor.eachAsync(async function (young: YoungDocument) {
      countTotal++;
      const applicationsCount = young?.phase2ApplicationStatus.filter((appStatus: string) =>
        [APPLICATION_STATUS.WAITING_VALIDATION, APPLICATION_STATUS.WAITING_VERIFICATION].includes(appStatus as any),
      ).length;
      if (applicationsCount < 15) {
        const esMissions = await getMissions({ young });
        const missions = esMissions?.map((mission) => ({
          structureName: mission._source.structureName?.toUpperCase(),
          name: mission._source.name,
          startAt: formatStringDate(mission._source.startAt),
          endAt: formatStringDate(mission._source.endAt),
          address: `${mission._source.city}, ${mission._source.zip}`,
          domains: mission._source.domains?.map(translate)?.join(", "),
          cta: `${config.APP_URL}/mission/${mission._id}`,
        }));
        if (!missions || !young || !esMissions) return;
        countMissionSent[missions.length] = (countMissionSent[missions.length] || 0) + 1;
        countMissionSentCohort[young.cohort!] = (countMissionSentCohort[young.cohort!] || 0) + 1;
        if (missions.length > 0) {
          countHit++;
          // send a mail to the young
          let template = SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION_AUTO;
          let cc = getCcOfYoung({ template, young });
          await sendTemplate(template, {
            emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
            params: {
              // @ts-ignore
              missions,
              cta: `${config.APP_URL}/mission?utm_campaign=transactionnel+nouvelles+mig+publiees&utm_source=notifauto&utm_medium=mail+237+acceder`,
            },
            cc,
          });
          // stock the list in young
          const missionsInMail = (young.missionsInMail || []).concat(esMissions.map((mission) => ({ missionId: mission._id, date: Date.now() })) as any);
          // This is used in order to minimize risk of version conflict.
          const youngForUpdate = await YoungModel.findById(young._id);
          if (!youngForUpdate) throw new Error(`Young not found ${young._id}`);
          youngForUpdate.set({ missionsInMail });
          await youngForUpdate.save({ fromUser: { firstName: `Cron ${fileName}` } });
        }
      }
    });
    if (countHit === 0) {
      slack.info({
        title: "noticePushMission",
        text: `Pas de jeunes ciblé(e)s.\nmails envoyés: ${countHit}\nPas de missions proposées.`,
      });
    } else {
      slack.info({
        title: "noticePushMission",
        text: `${countHit}/${countTotal} (${((countHit / countTotal) * 100).toFixed(
          2,
        )}%) jeunes ciblé(e)s.\nmails envoyés: ${countHit}\nnombre de missions proposées / mail : ${JSON.stringify(
          countMissionSent,
        )}\ncohortes (si missions proposées) : ${JSON.stringify(countMissionSentCohort)}`,
      });
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "noticePushMission", text: JSON.stringify(e) });
    throw e;
  }
};

const getMissions = async ({ young }: { young: YoungDocument }): Promise<EsMission[] | undefined> => {
  if (!young || !young.location || !young.location.lat || !young.location.lon) return;
  try {
    const excludedMissionIds = young?.missionsInMail?.map((m) => m.missionId);

    const header = { index: "mission", type: "_doc" };
    const query = {
      bool: {
        must_not: [
          {
            ids: {
              values: excludedMissionIds,
            },
          },
        ],
        filter: [
          // only validated missions...
          { term: { "status.keyword": MISSION_STATUS.VALIDATED } },
          //... that didn't reach their deadline...
          {
            range: {
              endAt: {
                gte: "now",
              },
            },
          },
          //... that have places left...
          {
            range: {
              placesLeft: {
                gt: 0,
              },
            },
          },
          //... that is in 20 km radius...
          {
            geo_distance: {
              distance: "20km",
              location: young.location,
            },
          },
        ],
      },
    };

    const sort = [
      {
        _geo_distance: {
          location: [young.location.lon, young.location.lat],
          order: "asc",
          unit: "km",
          mode: "min",
        },
      },
    ];

    const body = [
      header,
      {
        query,
        sort,
        size: 3,
      },
    ]
      .map((e) => `${JSON.stringify(e)}\n`)
      .join("");
    const response = await esClient.msearch({
      index: "mission",
      body,
    });
    return response?.body?.responses[0]?.hits?.hits;
  } catch (e) {
    capture(e);
    slack.error({ title: "noticePushMission", text: JSON.stringify(e) });
  }
};

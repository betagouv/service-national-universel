const esClient = require("../es");
const path = require("path");

const { capture } = require("../sentry");
const Young = require("../models/young");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, translate, formatStringDate, END_DATE_PHASE1 } = require("snu-lib");
const config = require("config");
const { getCcOfYoung } = require("../utils");
const fileName = path.basename(__filename, ".js");

exports.handler = async () => {
  try {
    let countTotal = 0;
    let countHit = 0;
    let countMissionSent = {};
    let countMissionSentCohort = {};

    const cohort = Object.keys(END_DATE_PHASE1).filter((key) => {
      const diff = diffYear(END_DATE_PHASE1[key], new Date());
      return diff < 1;
    });

    const cursor = Young.find({
      cohort: { $in: cohort },
      status: "VALIDATED",
      statusPhase1: "DONE",
      statusPhase2: { $nin: ["VALIDATED", "WITHDRAWN"] },
    }).cursor();
    await cursor.eachAsync(async function (young) {
      countTotal++;
      const applicationsCount = young?.phase2ApplicationStatus.filter((obj) => ["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(obj)).length;
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
        countMissionSent[missions?.length] = (countMissionSent[missions?.length] || 0) + 1;
        if (!missions) return;
        countMissionSentCohort[young?.cohort] = (countMissionSentCohort[young?.cohort] || 0) + 1;
        if (missions?.length > 0) {
          countHit++;
          // send a mail to the young
          let template = SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION_AUTO;
          let cc = getCcOfYoung({ template, young });
          await sendTemplate(template, {
            emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
            params: {
              missions,
              cta: `${config.APP_URL}/mission?utm_campaign=transactionnel+nouvelles+mig+publiees&utm_source=notifauto&utm_medium=mail+237+acceder`,
            },
            cc,
          });
          // stock the list in young
          const missionsInMail = (young.missionsInMail || []).concat(esMissions?.map((mission) => ({ missionId: mission._id, date: Date.now() })));
          // This is used in order to minimize risk of version conflict.
          const youngForUpdate = await Young.findOne({ _id: young._id });
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

const getMissions = async ({ young }) => {
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
          { term: { "status.keyword": "VALIDATED" } },
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

const diffYear = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d2.getFullYear() - d1.getFullYear();
};

require("../mongo");
const esClient = require("../es");

const { capture } = require("../sentry");
const Young = require("../models/young");
const { sendTemplate } = require("../sendinblue");
const slack = require("../slack");
const { SENDINBLUE_TEMPLATES, translate, formatStringDate } = require("snu-lib");
const { APP_URL } = require("../config");

exports.handler = async () => {
  try {
    let countTotal = 0;
    let countHit = 0;
    let countMissionSent = {};
    let countMissionSentCohort = {};

    const cursor = Young.find({ cohort: { $nin: ["2019", "2020"] }, status: "VALIDATED", statusPhase1: "DONE", statusPhase2: { $ne: "VALIDATED" } }).cursor();
    await cursor.eachAsync(async function (young) {
      countTotal++;
      const esMissions = await getMissions({ young });

      const missions = esMissions?.map((mission) => ({
        structureName: mission._source.structureName?.toUpperCase(),
        name: mission._source.name,
        startAt: formatStringDate(mission._source.startAt),
        endAt: formatStringDate(mission._source.endAt),
        address: `${mission._source.city}, ${mission._source.zip}`,
        domains: mission._source.domains?.map(translate)?.join(", "),
        cta: `${APP_URL}/mission/${mission._id}`,
      }));

      countMissionSent[missions?.length] = (countMissionSent[missions?.length] || 0) + 1;
      if (!missions) return;
      countMissionSentCohort[young?.cohort] = (countMissionSentCohort[young?.cohort] || 0) + 1;

      if (missions?.length > 0) {
        countHit++;

        // send a mail to the young
        sendTemplate(SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION_AUTO, {
          emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
          params: {
            missions,
            cta: `${APP_URL}/mission`,
          },
        });

        // stock the list in young
        const missionsInMail = (young.missionsInMail || []).concat(esMissions?.map((mission) => ({ missionId: mission._id, date: Date.now() })));
        young.set({ missionsInMail });
        await young.save();
      }
    });
    slack.info({
      title: "noticePushMission",
      text: `${countHit}/${countTotal} (${((countHit / countTotal) * 100).toFixed(
        2,
      )}%) jeunes ciblé(e)s.\nmails envoyés: ${countHit}\nnombre de missions proposées / mail : ${JSON.stringify(
        countMissionSent,
      )}\ncohortes (si missions proposées) : ${JSON.stringify(countMissionSentCohort)}`,
    });
  } catch (e) {
    capture(e);
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
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
    slack.success({ title: "noticePushMission", text: JSON.stringify(e) });
  }
};

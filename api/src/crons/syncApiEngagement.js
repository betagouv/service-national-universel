const fetch = require("node-fetch");
require("../mongo");
const { API_ENGAGEMENT_KEY } = require("../config");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const MissionApiModel = require("../models/missionAPI");

const SIZE = 1000;
let startTime = new Date();

const fetchData = (requestOptions, batch = 0) => {
  fetch(`https://api.api-engagement.beta.gouv.fr/v0/mission?skip=${batch * SIZE}&limit=${SIZE}`, requestOptions)
    .then((response) => response.json())
    .then((result) => sync(result))
    .then((rest) => (rest ? fetchData(requestOptions, ++batch) : cleanData()))
    .catch((error) => capture(error, { extra: { requestOptions, batch } }));
};

const sync = async (result) => {
  if (!result.ok) return captureMessage("Error while fetching missions from api-engagement", { extra: result });
  for (let i = 0; i < result.data.length; i++) {
    const t = result.data[i];
    t.lastSyncAt = Date.now();
    const m = await MissionApiModel.findById(t._id);
    if (!m) {
      await MissionApiModel.create(t);
    } else {
      m.set({ ...t });
      await m.save();
      await m.index();
    }
  }
  return result.data.length === SIZE;
};

const cleanData = async () => {
  try {
    await MissionApiModel.deleteMany({ lastSyncAt: { $lte: startTime } });
    slack.success({ title: "sync with missions api-engagement" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with missions api-engagement", text: "Error while deleting outdated missions !" });
  }
};

exports.handler = async () => {
  if (!API_ENGAGEMENT_KEY) {
    slack.error({ title: "sync with missions api-engagement", text: "I do not have any API_ENGAGEMENT_KEY !" });
    captureMessage("NO API_ENGAGEMENT_KEY");
    return;
  }
  try {
    const myHeaders = new fetch.Headers();
    myHeaders.append("apikey", API_ENGAGEMENT_KEY);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetchData(requestOptions);
  } catch (e) {
    capture(e);
  }
};
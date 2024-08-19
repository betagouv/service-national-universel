const fetch = require("node-fetch");
const config = require("config");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const { MissionAPIModel } = require("../models");

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
    const m = await MissionAPIModel.findById(t._id);
    if (!m) {
      await MissionAPIModel.create(t);
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
    await MissionAPIModel.deleteMany({ lastSyncAt: { $lte: startTime } });
    slack.success({ title: "sync with missions api-engagement" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with missions api-engagement", text: "Error while deleting outdated missions !" });
  }
};

exports.handler = async () => {
  if (!config.API_ENGAGEMENT_KEY) {
    slack.error({ title: "sync with missions api-engagement", text: "I do not have any API_ENGAGEMENT_KEY !" });
    const err = new Error("NO API_ENGAGEMENT_KEY");
    capture(err);
    throw err;
  }
  try {
    const myHeaders = new fetch.Headers();
    myHeaders.append("apikey", config.API_ENGAGEMENT_KEY);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    fetchData(requestOptions);
  } catch (e) {
    capture(e);
    throw e;
  }
};

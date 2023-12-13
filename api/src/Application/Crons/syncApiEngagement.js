const fetch = require("node-fetch");
require("../../Infrastructure/Databases/Mongo/mongo");
const { API_ENGAGEMENT_KEY } = require("../../Infrastructure/Config/config");
const { capture } = require("../../Infrastructure/Services/sentry");
const slack = require("../../Infrastructure/Services/slack");
const MissionApiModel = require("../../Infrastructure/Databases/Mongo/Models/missionAPI");

const SIZE = 1000;
let startTime = new Date();

const fetchData = (requestOptions, batch = 0) => {
  fetch(`https://api.api-engagement.beta.gouv.fr/v0/mission?skip=${batch * SIZE}&limit=${SIZE}`, requestOptions)
    .then((response) => response.json())
    .then((result) => sync(result))
    .then((rest) => (rest ? fetchData(requestOptions, ++batch) : cleanData()))
    .catch((error) => console.log("error", error));
};

const sync = async (result) => {
  if (!result.ok) return console.log("ERROR", result);
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
  // slack.info({ title: "sync with missions api-engagement", text: "I'm cleaning the outdated missions !" });
  try {
    await MissionApiModel.deleteMany({ lastSyncAt: { $lte: startTime } });
    slack.success({ title: "sync with missions api-engagement" });
  } catch (error) {
    capture(error);
    slack.error({ title: "sync with missions api-engagement", text: "Error while deleting outdated missions !" });
  }
};

exports.handler = async () => {
  // slack.info({ title: "sync with missions api-engagement", text: "I'm starting the synchronization !" });
  if (!API_ENGAGEMENT_KEY) {
    slack.error({ title: "sync with missions api-engagement", text: "I do not have any API_ENGAGEMENT_KEY !" });
    capture("NO API_ENGAGEMENT_KEY");
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

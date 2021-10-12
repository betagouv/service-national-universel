require("dotenv").config({ path: "./../../.env-staging" });

const fetch = require("node-fetch");
require("../mongo");
const { API_ENGAGEMENT_KEY } = require("../config");
const { capture } = require("../sentry");
const MissionApiModel = require("../models/missionAPI");

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
  capture("CLEANING OUTDATED MISSIONS API ENGAGEMENT");
  try {
    await MissionApiModel.deleteMany({ lastSyncAt: { $lte: startTime } });
  } catch (error) {
    capture("ERROR WHILE DELETING OUTDATED", error);
  }
};

exports.handler = async () => {
  capture("START IMPORT MISSIONS API ENGAGEMENT");
  if (!API_ENGAGEMENT_KEY) {
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
    console.log("START at", startTime);
    console.log("SIZE", SIZE);
    fetchData(requestOptions);
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};

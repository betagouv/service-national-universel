require("dotenv").config({ path: "./../.env-prod" });

require("../src/mongo");
const fetch = require("node-fetch");
var myHeaders = new fetch.Headers();
const MissionApiModel = require("../src/models/missionApi");
const API_ENGAGEMENT_KEY = process.env.API_ENGAGEMENT_KEY;

if (!API_ENGAGEMENT_KEY) {
  console.log("NO API_ENGAGEMENT_KEY");
  process.exit(1);
}
myHeaders.append("apikey", API_ENGAGEMENT_KEY);
var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

const startTime = new Date();
console.log("START", startTime);

let s = 0;
const SIZE = 1000;
console.log("SIZE", SIZE);

const fetchData = (skip = 0) => {
  console.log("BATCH", skip);
  fetch(`https://api.api-engagement.beta.gouv.fr/v0/mission?skip=${skip * SIZE}&limit=${SIZE}`, requestOptions)
    .then((response) => response.json())
    .then((result) => sync(result))
    .then((rest) => (rest ? fetchData(++s) : cleanData()))
    .catch((error) => console.log("error", error));
};

const sync = async (result) => {
  if (!result.ok) return console.log("ERROR", result);
  for (let i = 0; i < result.data.length; i++) {
    i % 100 === 0 && console.log(i);
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
  console.log("CLEAN");
  // await MissionApiModel.deleteMany({ lastSyncAt: { $lte: startTime } });
  process.exit(0);
};

fetchData();

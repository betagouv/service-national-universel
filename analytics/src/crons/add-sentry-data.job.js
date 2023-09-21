require("dotenv").config();

require("../services/databases/postgresql.service");
const { capture } = require("../sentry");
const sentryModel = require("../models/sentry-info.model");
const { SENTRY_READ_TOKEN } = require("../config");
const fetch = require("node-fetch");
const slack = require("../slack");

module.exports.handler = async function () {
  try {
    //yesterday date in YYYY-MM-DD at 00:00:00 format
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);

    // convert date to epoch
    const startDateEpoch = Math.floor(startDate.getTime() / 1000);
    const endDateEpoch = Math.floor(endDate.getTime() / 1000);

    let receivedData, rejectedData, blacklistedData;
    const statsArray = ["received", "rejected", "blacklisted"];

    for (let stat of statsArray) {
      const url = `https://sentry.selego.co/api/0/projects/sentry/snu-production/stats/?since=${startDateEpoch}&until=${endDateEpoch}&stat=${stat}&resolution=1d`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${SENTRY_READ_TOKEN}` },
      });
      const data = await response.json();

      switch (stat) {
        case "received":
          receivedData = data;
          break;
        case "rejected":
          rejectedData = data;
          break;
        case "blacklisted":
          blacklistedData = data;
          break;
      }
    }

    const acceptedErrors = receivedData[0][1] - rejectedData[0][1] - blacklistedData[0][1];

    //startDate as YYYY/MM/DD without zone
    const date = `${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}`;

    sentryModel.create({
      nb_errors_total: receivedData[0][1],
      nb_errors_accepted: acceptedErrors,
      nb_errors_rejected: rejectedData[0][1],
      nb_errors_blacklisted: blacklistedData[0][1],
      date,
    });

    slack.success({ title: "Sentry Add Data crons", text: "Data was added successfully!" });
  } catch (error) {
    capture(error);
    slack.error({ title: `Sentry Add Data crons - ERROR`, text: JSON.stringify(error) });
  }
};

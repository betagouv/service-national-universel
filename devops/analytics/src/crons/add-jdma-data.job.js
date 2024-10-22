const { db } = require("../services/databases/postgresql.service");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const Demarche = require("../models/demarche-jdma.model");
const { JDMA_LOGIN, JDMA_PASSWORD } = require("../config");

const ONE_DAY_IN_MS = 86400000; // one day in milliseconds

module.exports.handler = function () {
  let count = 0;
  // Sync the model with the database, this creates the table if it does not exist
  Demarche.sync()
    .then(() => {
      console.log("Demarche table has been successfully created, if it did not exist");

      const demarches = [
        { id: 3507, nom: "Inscrire sa structure sur la plateforme du Service National Universel" },
        { id: 3508, nom: "Proposer une mission d'intérêt général sur la plateforme du Service National Universel" },
        { id: 3154, nom: "S'inscrire au Service National Universel" },
        { id: 3504, nom: "Valider sa participation au séjour de cohésion du Service National Universel" },
      ];

      // Minus one day is because the API JDMA fetch all the data of the day and the CRON is at 02h
      const endDate = Date.now() - ONE_DAY_IN_MS;
      // 1 minute is enough because the range of the date doesn't matter as it gives all the data for the day
      const startDate = endDate - 60000;

      function formatTimestamp(timestamp) {
        const date = new Date(timestamp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

        const offsetHours = "02";
        const offsetMinutes = "00";

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} +${offsetHours}${offsetMinutes}`;

        return formattedDate;
      }
      const demarcheDate = formatTimestamp(startDate);

      // Fetch data for each demarche and insert it into the table
      const promises = demarches.map((demarche) => {
        const url = `https://observatoire.numerique.gouv.fr/rest/observatoire/avistats/aggregatebyday/demarche/${demarche.id}?media=json&question=easy&question=satisfaction&question=comprehensible&date_start=${startDate}&date_end=${endDate}`;
        const headers = { Authorization: "Basic " + Buffer.from(`${JDMA_LOGIN}:${JDMA_PASSWORD}`).toString("base64") };

        return fetch(url, { headers })
          .then((response) => response.json())
          .then((data) => {
            return Demarche.create({
              demarcheId: demarche.id,
              nom: demarche.nom,
              answersTotal: data.answersTotal,
              satisfaction_negative: data.satisfaction.negative,
              satisfaction_neutral: data.satisfaction.neutral,
              satisfaction_positive: data.satisfaction.positive,
              easy_negative: data.easy.negative,
              easy_neutral: data.easy.neutral,
              easy_positive: data.easy.positive,
              comprehensible_negative: data.comprehensible.negative,
              comprehensible_neutral: data.comprehensible.neutral,
              comprehensible_positive: data.comprehensible.positive,
              demarcheDate: demarcheDate,
            }).then(() => {
              count++;
            });
          });
      });
      Promise.all(promises)
        .then(() => {
          if (count === 4) {
            slack.success({ title: "JDMA synchronization", text: `${count}/4 demarches have been successfully synchronized!` });
          } else {
            slack.error({ title: "JDMA synchronization - INCOMPLETE", text: `Only ${count}/4 demarches were synchronized. Some failed.` });
          }

          return db.cacheClear();
        })
        .catch((e) => {
          capture(e);
          captureMessage(`Error during synchronization: ${e.message}`);
          slack.error({ title: "JDMA synchronization - ERROR", text: JSON.stringify(e) });
        });
    })
    .catch((e) => {
      capture(e);
      slack.error({ title: `JDMA synchronization - ERROR`, text: JSON.stringify(e) });
    });
};

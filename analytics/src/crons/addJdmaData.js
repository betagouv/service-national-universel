require("dotenv").config({ path: "../../.env" });
require("../postgresql");
const { capture } = require("../sentry");
const slack = require("../slack");
const fetch = require("node-fetch");
const Demarche = require("../models/demarche_JDMA");
const { JDMA_LOGIN, JDMA_PASSWORD } = require("../config");
let count = 0;
let total = 0;
const ONE_DAY_IN_MS = 86400000; // one day in milliseconds

module.exports.handler = function () {
  // Sync the model with the database, this creates the table if it does not exist
  Demarche.sync()
    .then(() => {
      console.log("Demarche table has been successfully created, if it did not exist");

      // Your demarches array
      const demarches = [
        { id: 3507, nom: "Inscrire sa structure sur la plateforme du Service National Universel" },
        { id: 3508, nom: "Proposer une mission d'intérêt général sur la plateforme du Service National Universel" },
        { id: 3154, nom: "S'inscrire au Service National Universel" },
        { id: 3504, nom: "Valider sa participation au séjour de cohésion du Service National Universel" },
      ];

      // Your dates
      const endDate = Date.now();
      const startDate = endDate - ONE_DAY_IN_MS;

      function formatTimestamp(timestamp) {
        const date = new Date(timestamp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

        const offsetMinutes = date.getTimezoneOffset();
        const offsetSign = offsetMinutes < 0 ? "+" : "-";
        const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
          .toString()
          .padStart(2, "0");
        const offsetMinutesFormatted = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} ${offsetSign}${offsetHours}${offsetMinutesFormatted}`;

        return formattedDate;
      }
      const demarcheDate = formatTimestamp(startDate);

      // Fetch data for each demarche and insert it into the table
      const promises = demarches.map((demarche) => {
        total++;
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
          slack.success({ title: "JDMA synchronization", text: `${count}/${total} demarches have been successfully synchronized!` });
        })
        .catch((e) => {
          capture(e);
          slack.error({ title: "JDMA synchronization - ERROR", text: JSON.stringify(e) });
          console.error("Error during synchronization:", e);
        });
    })
    .catch((e) => {
      capture(e);
      slack.error({ title: `JDMA synchronization - ERROR`, text: JSON.stringify(e) });
    });
};

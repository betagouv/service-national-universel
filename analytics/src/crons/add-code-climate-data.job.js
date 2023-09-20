require("dotenv").config();

require("../services/databases/postgresql.service");
const { capture } = require("../sentry");
const codeClimate = require("../models/code-climate.model");
const fetch = require("node-fetch");
const slack = require("../slack");

module.exports.handler = async function () {
  const date = new Date();
  const yesterday = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate() - 1}`;
  // filter[to] and filter[from] query paramerets

  try {
    const url = `https://api.codeclimate.com/v1/repos/6034fa54fc4de61073009538/metrics/technical_debt_ratio?filter[from]=${yesterday}&filter[to]=${yesterday}`;
    // today date in YYYY/MM/DD format
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    const { data } = await response.json();
    const technical_debt_ratio = data.attributes.points[0].value;

    const url_test_coverage = `https://api.codeclimate.com/v1/repos/6034fa54fc4de61073009538/metrics/test_coverage?filter[from]=${yesterday}&filter[to]=${yesterday}`;
    const response_test_coverage = await fetch(url_test_coverage, {
      headers: { "Content-Type": "application/json" },
    });
    const { data: data_test_coverage } = await response_test_coverage.json();
    const test_coverage = data_test_coverage.attributes.points[0].value;

    codeClimate.create({
      technical_debt_ratio,
      test_coverage,
      date: yesterday,
    });
    slack.success({ title: "CodeClimate Add Data crons", text: "Data was added successfully!" });
  } catch (error) {
    capture(error);
    slack.error({ title: `CodeClimate Add Data crons - ERROR`, text: JSON.stringify(error) });
  }
};

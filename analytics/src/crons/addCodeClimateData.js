require("dotenv").config();

require("../postgresql");
const { capture } = require("../sentry");
const codeClimate = require("../models/codeClimate");
//const { CODE_CLIMATE_TOKEN } = require("../config");
const fetch = require("node-fetch");

module.exports.handler = async function () {
  // post request only
  const date = new Date();
  const today = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  // filter[to] and filter[from] query paramerets

  try {
    const url = `https://api.codeclimate.com/v1/repos/6034fa54fc4de61073009538/metrics/technical_debt_ratio?filter[from]=${today}&filter[to]=${today}`;
    // today date in YYYY/MM/DD format
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    const { data } = await response.json();
    const technical_debt_ratio = data.attributes.points[0].value;

    const url_test_coverage = `https://api.codeclimate.com/v1/repos/6034fa54fc4de61073009538/metrics/test_coverage?filter[from]=${today}&filter[to]=${today}`;
    const response_test_coverage = await fetch(url_test_coverage, {
      headers: { "Content-Type": "application/json" },
    });
    const { data: data_test_coverage } = await response_test_coverage.json();
    const test_coverage = data_test_coverage.attributes.points[0].value;

    codeClimate.create({
      technical_debt_ratio,
      test_coverage,
    });
    console.log(technical_debt_ratio, test_coverage);
  } catch (error) {
    capture(error);
  }
};

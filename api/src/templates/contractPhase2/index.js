const fs = require("fs");
const path = require("path");
const config = require("../../config");

const getBaseUrl = () => {
  if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  return "http://localhost:8080";
};

const render = async (contract) => {
  try {
    const html = fs.readFileSync(path.resolve(__dirname, "./contract.html"), "utf8");
    return html.replace(/{{CONTRACT_ID}}/g, contract._id).replace(/{{BASE_URL}}/g, getBaseUrl());
  } catch (e) {
    throw e;
  }
};

module.exports = { render };

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
    let html = fs.readFileSync(path.resolve(__dirname, "./contract.html"), "utf8");
    html.replace(/{{CONTRACT_ID}}/g, contract._id).replace(/{{BASE_URL}}/g, getBaseUrl());
    html = replaceField(html, contract, "projectManagerFirstName");
    html = replaceField(html, contract, "projectManagerLastName");
    html = replaceField(html, contract, "projectManagerRole");
    html = replaceField(html, contract, "projectManagerEmail");
    html = replaceField(html, contract, "structureManagerFirstName");
    html = replaceField(html, contract, "structureManagerLastName");
    html = replaceField(html, contract, "structureManagerRole");
    html = replaceField(html, contract, "structureManagerEmail");
    html = replaceField(html, contract, "structureSiret");
    html = replaceField(html, contract, "youngFirstName");
    html = replaceField(html, contract, "youngLastName");
    html = replaceField(html, contract, "youngBirthdate");
    html = replaceField(html, contract, "youngAddress");
    html = replaceField(html, contract, "youngCity");
    html = replaceField(html, contract, "youngDepartment");
    html = replaceField(html, contract, "youngEmail");
    html = replaceField(html, contract, "youngPhone");
    return html;
  } catch (e) {
    throw e;
  }
};

const replaceField = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  return str.replace(regex, context[field]);
};

module.exports = { render };

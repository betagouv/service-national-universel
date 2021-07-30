const fs = require("fs");
const path = require("path");
const config = require("../../config");
const { formatDateFRTimezoneUTC } = require("snu-lib");

const getBaseUrl = () => {
  if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  return "http://localhost:8080";
};

const render = async (contract) => {
  try {
    let html = fs.readFileSync(path.resolve(__dirname, "./contract.html"), "utf8");
    html = html.replace(/{{CONTRACT_ID}}/g, contract._id).replace(/{{BASE_URL}}/g, getBaseUrl());
    html = addParents(html, contract, "isYoungAdult");
    html = addSignature(html, contract, "status");
    html = replaceDate(html, contract, "date");
    html = replaceDate(html, contract, "youngBirthdate");
    html = replaceDate(html, contract, "missionStartAt");
    html = replaceDate(html, contract, "missionEndAt");
    html = replaceField(html, contract._doc);
    return html;
  } catch (e) {
    throw e;
  }
};

const addParents = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  let content = "";
  if (context.isYoungAdult === "false") {
    content = `
      <h2>Représenté par ses représentant légaux</h2>
      <div>
        1) Le représentant légal du volontaire n°1 disposant de l’autorité parentale :
        <div class="field" name="parent1Name" placeholder="Prénom" context="{context}">
          <p class="attributes">${context.parent1LastName} ${context.parent1FirstName}</p>
        </div>
        <div class="field" name="parent1Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">{{parent1Address}} ${context.parent1City} ${context.parent1Department}</p>
        </div>
        <div class="field" name="parent1Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">${context.parent1Email}</p>
        </div>
        <div class="field" name="parent1Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">${context.parent1Phone}</p>
        </div>
      </div>
    `;
    if (context.parent2Email)
      content += ` 
      <div>
        1) Le représentant légal du volontaire n°2 disposant de l’autorité parentale :
        <div class="field" name="parent2Name" placeholder="Prénom" context="{context}">
          <p class="attributes">${context.parent2LastName} ${context.parent2FirstName}</p>
        </div>
        <div class="field" name="parent2Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">${context.parent2Address} ${context.parent2City} ${context.parent2Department}</p>
        </div>
        <div class="field" name="parent2Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">${context.parent2Email}</p>
        </div>
        <div class="field" name="parent2Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">${context.parent2Phone}</p>
        </div>
      </div>
      `;
  }
  return str.replace(regex, content);
};

const replaceField = (str, context) => {
  Object.keys(context).forEach((key) => {
    const regex = new RegExp("{{" + key + "}}", "g");
    str = str.replace(regex, context[key]);
  });
  return str;
};

const badgeSignature = (status) => {
  return `
      <div style="position: relative;
      display: inline-block;
      padding: 0.25rem 1rem;
      margin: 0.25rem 0.25rem;
      border-radius: 99999px;
      font-size: 0.8rem;
      font-weight: 500;
      color: #9a9a9a;
      background-color: #f6f6f6;
      border: 1px solid #cecece;
      color: ${status === "VALIDATED" ? `#6CC763` : `#FE7B52`};
      background-color: ${status === "VALIDATED" ? `#6CC76333` : `#FE7B5233`};
      border: 1px solid ${status === "VALIDATED" ? `#6CC763` : `#FE7B52`};;">${status === "VALIDATED" ? `Validé` : `En attente de validation`}</div>
  `;
};

const addSignature = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  let content = `
    <div style="display: grid; grid-auto-columns: 1fr; grid-auto-flow: column;">
      <div style="text-align: center;">
        <div>Représentant de l'état</div>
        ${badgeSignature(context.projectManagerStatus)}
      </div>
      <div style="text-align: center;">
        <div>Représentant structure</div>
        ${badgeSignature(context.structureManagerStatus)}
      </div>
      ${
        context.isYoungAdult == "true"
          ? `
          <div style="text-align: center;">
            <div>Volontaire</div>
            ${badgeSignature(context.youngContractStatus)}
          </div>
      `
          : `<div style="text-align: center;">
              <div>Représentant légal 1</div>
              ${badgeSignature(context.parent1Status)}
            </div>
      ${
        context.parent2Email
          ? `<div style="text-align: center;">
              <div>Représentant légal 2</div>
              ${badgeSignature(context.parent2Status)}
            </div>`
          : ``
      }
      `
      }
    </div>
  `;
  return str.replace(regex, content);
};

const replaceDate = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  return str.replace(regex, formatDateFRTimezoneUTC(context[field]));
};

module.exports = { render };

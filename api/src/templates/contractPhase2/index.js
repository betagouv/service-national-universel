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
    html = html.replace(/{{CONTRACT_ID}}/g, contract._id).replace(/{{BASE_URL}}/g, getBaseUrl());
    html = addParents(html, contract, "isYoungAdult");
    html = addSignature(html, contract, "status");
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
    html = replaceDate(html, contract, "youngBirthdate");
    html = replaceField(html, contract, "youngAddress");
    html = replaceField(html, contract, "youngCity");
    html = replaceField(html, contract, "youngDepartment");
    html = replaceField(html, contract, "youngEmail");
    html = replaceField(html, contract, "youngPhone");
    html = replaceField(html, contract, "missionName");
    html = replaceField(html, contract, "missionObjective");
    html = replaceField(html, contract, "missionAction");
    html = replaceDate(html, contract, "missionStartAt");
    html = replaceDate(html, contract, "missionEndAt");
    html = replaceField(html, contract, "missionDuration");
    html = replaceField(html, contract, "missionAddress");
    html = replaceField(html, contract, "missionCity");
    html = replaceField(html, contract, "missionZip");
    html = replaceField(html, contract, "missionFrequence");
    html = replaceField(html, contract, "structureName");
    html = replaceField(html, contract, "structureManagerFirstName");
    html = replaceField(html, contract, "structureManagerLastName");
    html = replaceDate(html, contract, "date");
    html = replaceField(html, contract, "parent1FirstName");
    html = replaceField(html, contract, "parent1LastName");
    html = replaceField(html, contract, "parent1Address");
    html = replaceField(html, contract, "parent1City");
    html = replaceField(html, contract, "parent1Department");
    html = replaceField(html, contract, "parent1Email");
    html = replaceField(html, contract, "parent1Phone");
    html = replaceField(html, contract, "parent2FirstName");
    html = replaceField(html, contract, "parent2LastName");
    html = replaceField(html, contract, "parent2Address");
    html = replaceField(html, contract, "parent2City");
    html = replaceField(html, contract, "parent2Department");
    html = replaceField(html, contract, "parent2Email");
    html = replaceField(html, contract, "parent2Phone");
    html = replaceField(html, contract, "projectManagerStatus");
    html = replaceField(html, contract, "structureManagerStatus");
    html = replaceField(html, contract, "youngContractStatus");
    html = replaceField(html, contract, "parent1Status");
    html = replaceField(html, contract, "parent2Status");
    return html;
  } catch (e) {
    throw e;
  }
};

const addParents = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  let content = "";
  if (context.isYoungAdult == "false") {
    content = `
      <h2>Représenté par ses représentant légaux</h2>
      <div>
        1) Le représentant légal du volontaire n°1 disposant de l’autorité parentale :
        <div class="field" name="parent1Name" placeholder="Prénom" context="{context}">
          <p class="attributes">{{parent1LastName}} {{parent1FirstName}}</p>
        </div>
        <div class="field" name="parent1Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">{{parent1Address}} {{parent1City}} {{parent1Department}}</p>
        </div>
        <div class="field" name="parent1Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">{{parent1Email}}</p>
        </div>
        <div class="field" name="parent1Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">{{parent1Phone}}</p>
        </div>
      </div>
    `;
    if (context.parent2Email)
      content += ` 
      <div>
        1) Le représentant légal du volontaire n°2 disposant de l’autorité parentale :
        <div class="field" name="parent2Name" placeholder="Prénom" context="{context}">
          <p class="attributes">{{parent2LastName}} {{parent2FirstName}}</p>
        </div>
        <div class="field" name="parent2Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">{{parent2Address}} {{parent2City}} {{parent2Department}}</p>
        </div>
        <div class="field" name="parent2Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">{{parent2Email}}</p>
        </div>
        <div class="field" name="parent2Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">{{parent2Phone}}</p>
        </div>
      </div>
      `;
  }
  return str.replace(regex, content);
};

const replaceField = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  return str.replace(regex, context[field]);
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

const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR");
};

const replaceDate = (str, context, field) => {
  const regex = new RegExp("{{" + field + "}}", "g");
  return str.replace(regex, formatDateFR(context[field]));
};

module.exports = { render };

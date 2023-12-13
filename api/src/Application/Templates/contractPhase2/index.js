const fs = require("fs");
const path = require("path");
const { formatDateFRTimezoneUTC } = require("snu-lib");
const { getBaseUrl, sanitizeAll } = require("../../Utils");

const render = async (contract) => {
  let html = fs.readFileSync(path.resolve(__dirname, "./contract.html"), "utf8");
  html = html.replace(/{{CONTRACT_ID}}/g, sanitizeAll(contract._id)).replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()));
  html = addParents(html, contract, "isYoungAdult");
  html = addSignature(html, contract, "status");
  html = replaceDate(html, contract, "date");
  html = replaceDate(html, contract, "youngBirthdate");
  html = replaceDate(html, contract, "missionStartAt");
  html = replaceDate(html, contract, "missionEndAt");
  html = replaceField(html, contract._doc);
  return html;
};

const addParents = (str, context, field) => {
  let content = "";
  if (context.isYoungAdult === "false") {
    content = `
      <h2>Représenté par ses représentants légaux</h2>
      <div>
        1) Le représentant légal du volontaire n°1 disposant de l’autorité parentale :
        <div class="field" name="parent1Name" placeholder="Prénom" context="{context}">
          <p class="attributes">${sanitizeAll(context.parent1LastName)} ${sanitizeAll(context.parent1FirstName)}</p>
        </div>
        <div class="field" name="parent1Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">{{parent1Address}} ${sanitizeAll(context.parent1City)} ${sanitizeAll(context.parent1Department)}</p>
        </div>
        <div class="field" name="parent1Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">${sanitizeAll(context.parent1Email)}</p>
        </div>
        <div class="field" name="parent1Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">${sanitizeAll(context.parent1Phone)}</p>
        </div>
      </div>
    `;
    if (context.parent2Email)
      content += ` 
      <div>
        1) Le représentant légal du volontaire n°2 disposant de l’autorité parentale :
        <div class="field" name="parent2Name" placeholder="Prénom" context="{context}">
          <p class="attributes">${sanitizeAll(context.parent2LastName)} ${sanitizeAll(context.parent2FirstName)}</p>
        </div>
        <div class="field" name="parent2Address" placeholder="Adresse" className="md" context="{context}">
          demeurant :
          <p class="attributes">${sanitizeAll(context.parent2Address)} ${sanitizeAll(context.parent2City)} ${sanitizeAll(context.parent2Department)}</p>
        </div>
        <div class="field" name="parent2Email" placeholder="Email" className="md" type="email" context="{context}">
          Email :
          <p class="attributes">${sanitizeAll(context.parent2Email)}</p>
        </div>
        <div class="field" name="parent2Phone" placeholder="0123456789" className="md" context="{context}">
          Téléphone :
          <p class="attributes">${sanitizeAll(context.parent2Phone)}</p>
        </div>
      </div>
      `;
  }
  return str.replaceAll("{{" + field + "}}", content);
};

const replaceField = (str, context) => {
  Object.keys(context).forEach((key) => {
    str = str.replaceAll("{{" + key + "}}", sanitizeAll(context[key]));
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
  let content = `
    <div style="display: grid; grid-auto-columns: 1fr; grid-auto-flow: column;">
      <div style="text-align: center;">
        <div>Représentant de l'état</div>
        <div>
        ${sanitizeAll(context.projectManagerLastName)}
        ${sanitizeAll(context.projectManagerFirstName)}
        </div>
        ${badgeSignature(sanitizeAll(context.projectManagerStatus))}
        <div>
        ${context.projectManagerValidationDate ? formatDateFRTimezoneUTC(context.projectManagerValidationDate) : ""}
        </div>
      </div>
      <div style="text-align: center;">
        <div>Représentant structure</div>
        <div>
        ${sanitizeAll(context.structureManagerLastName)}
        ${sanitizeAll(context.structureManagerFirstName)}
        </div>  
        ${badgeSignature(sanitizeAll(context.structureManagerStatus))}
        <div>
        ${context.structureManagerValidationDate ? formatDateFRTimezoneUTC(context.structureManagerValidationDate) : ""}
        </div>
      </div>
      ${
        context.isYoungAdult == "true"
          ? `
          <div style="text-align: center;">
            <div>Volontaire</div>
            <div>
            ${sanitizeAll(context.youngContractLastName)}
            ${sanitizeAll(context.youngContractFirstName)}
            </div>
            ${badgeSignature(sanitizeAll(context.youngContractStatus))}
            <div>
            ${context.youngContractValidationDate ? formatDateFRTimezoneUTC(context.youngContractValidationDate) : ""}
            </div>
          </div>
      `
          : `<div style="text-align: center;">
              <div>Représentant légal 1</div>
              <div>
              ${sanitizeAll(context.parent1LastName)}
              ${sanitizeAll(context.parent1FirstName)}
              </div>
              ${badgeSignature(sanitizeAll(context.parent1Status))}
              <div>
              ${context.parent1ValidationDate ? formatDateFRTimezoneUTC(context.parent1ValidationDate) : ""}
              </div>
            </div>
      ${
        context.parent2Email
          ? `<div style="text-align: center;">
              <div>Représentant légal 2</div>
              <div>
              ${sanitizeAll(context.parent2LastName)}
              ${sanitizeAll(context.parent2FirstName)}
              </div>
              ${badgeSignature(sanitizeAll(context.parent2Status))}
              <div>
              ${context.parent2ValidationDate ? formatDateFRTimezoneUTC(context.parent2ValidationDate) : ""}
              </div>
            </div>`
          : ``
      }
      `
      }
    </div>
  `;
  return str.replaceAll("{{" + field + "}}", content);
};

const replaceDate = (str, context, field) => {
  return str.replaceAll("{{" + field + "}}", sanitizeAll(formatDateFRTimezoneUTC(context[field])));
};

module.exports = { render };

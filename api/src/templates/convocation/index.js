/* eslint-disable no-useless-catch */
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
require("dayjs/locale/fr");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const SessionPhase1 = require("../../models/sessionPhase1");
const CohortModel = require("../../models/cohort");

const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");

const DepartmentServiceModel = require("../../models/departmentService");
const { formatStringDate, formatStringDateTimezoneUTC, regionsListDROMS, translateCohortTemp } = require("snu-lib");

const datefns = require("date-fns");
var { fr } = require("date-fns/locale");

const isFromDOMTOM = (young) => {
  return (
    ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
      young.department,
    ) && young.grade !== "Terminale"
  );
};

function getBg() {
  return getSignedUrl("convocation/convocation_template_base.png");
}
function getTop() {
  return getSignedUrl("convocation/top.png");
}
function getBottom() {
  return getSignedUrl("convocation/bottom.png");
}

const render = async (young) => {
  const getMeetingAddress = (meetingPoint, center) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    const complement = meetingPoint?.complementAddress.find((c) => c.cohort === young.cohort);
    const complementText = complement?.complement ? ", " + complement.complement : "";
    return meetingPoint.name + ", " + meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city + complementText;
  };

  try {
    if (!["AFFECTED", "DONE", "NOT_DONE"].includes(young.statusPhase1)) throw `young ${young.id} not affected`;
    if (!young.sessionPhase1Id || (!young.meetingPointId && young.deplacementPhase1Autonomous !== "true")) throw `young ${young.id} unauthorized`;
    const session = await SessionPhase1.findById(young.sessionPhase1Id);
    if (!session) throw `session ${young.sessionPhase1Id} not found for young ${young._id}`;
    const center = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!center) throw `center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`;

    const meetingPoint = await PointDeRassemblementModel.findById(young.meetingPointId);
    let ligneToPoint = null;
    let ligneBus = null;

    if (meetingPoint && young.ligneId) {
      ligneBus = await LigneBusModel.findById(young.ligneId);
      ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId });
    }

    const cohort = await CohortModel.findOne({ name: young.cohort });
    cohort.dateStart.setMinutes(cohort.dateStart.getMinutes() - cohort.dateStart.getTimezoneOffset());
    cohort.dateEnd.setMinutes(cohort.dateEnd.getMinutes() - cohort.dateEnd.getTimezoneOffset());

    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;
    const contacts = service?.contacts.filter((c) => c.cohort === young.cohort) || [];

    const cohortDateStart = new Date(cohort?.dateStart);
    const cohortDateEnd = new Date(cohort?.dateEnd);
    //add 12h to dateStart
    cohortDateStart.setHours(cohortDateStart.getHours() + 12);
    //add 12h to dateEnd
    cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);

    const departureDate = () => {
      if (ligneBus?.departuredDate) {
        return ligneBus?.departuredDate;
      }
      if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
        return new Date(2023, 6, 5);
      }
      return cohort.dateStart;
    };

    const returnDate = () => {
      if (ligneBus?.returnDate) {
        return ligneBus?.returnDate;
      }
      if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
        return new Date(2023, 6, 17);
      }
      return cohort.dateEnd;
    };

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesion.html"), "utf8");
    return html
      .replace(
        /{{CONTACTS}}/g,
        sanitizeAll(
          contacts
            .map((contact) => {
              return `<li>${contact.contactName} - ${contact.contactPhone || ""} - ${contact.contactMail || ""}</li>`;
            })
            .join(""),
        ),
      )
      .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
      .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
      .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
      .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
      .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
      .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
      .replace(/{{CITY}}/g, sanitizeAll(young.city))
      .replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(translateCohortTemp(young)))
      .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
      .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
      .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
      .replace(/{{MEETING_DATE}}/g, sanitizeAll(dayjs(departureDate()).locale("fr-FR").format("dddd DD MMMM YYYY")))
      .replace(/{{MEETING_HOURS}}/g, sanitizeAll(`<b>A</b> ${meetingPoint ? ligneToPoint.meetingHour : "16:00"}`))
      .replace(/{{MEETING_ADDRESS}}/g, sanitizeAll(`<b>Au</b> ${getMeetingAddress(meetingPoint, center)}`))
      .replace(/{{TRANSPORT}}/g, sanitizeAll(ligneBus ? `<b>Numéro de transport</b> : ${ligneBus.busId}` : ""))
      .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(dayjs(returnDate()).locale("fr").format("dddd DD MMMM YYYY")))
      .replace(/{{MEETING_HOURS_RETURN}}/g, sanitizeAll(meetingPoint ? ligneToPoint.returnHour : "11:00"))
      .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
      .replace(/{{TOP}}/g, sanitizeAll(getTop()))
      .replace(/{{BOTTOM}}/g, sanitizeAll(getBottom()))
      .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg()))
      .replace(
        /{{SANITARY_INSTRUCTIONS}}/g,
        sanitizeAll(
          `<li>en fonction des consignes sanitaires le jour du départ, 2 masques jetables à usage médical pour le transport en commun${ligneBus?.lunchBreak ? "," : "."}</li>`,
        ),
      )
      .replace(/{{LUNCH_BREAK}}/g, sanitizeAll(ligneBus?.lunchBreak ? `<li>une collation ou un déjeuner froid pour le repas.</li>` : ""));
  } catch (e) {
    throw e;
  }
};

const renderLocalTransport = async (young) => {
  console.log(getBaseUrl());
  try {
    if (!["AFFECTED", "DONE", "NOT_DONE"].includes(young.statusPhase1)) throw `young ${young.id} not affected`;
    if (!young.sessionPhase1Id) throw `young ${young.id} unauthorized`;
    const session = await SessionPhase1.findById(young.sessionPhase1Id);
    if (!session) throw `session ${young.sessionPhase1Id} not found for young ${young._id}`;
    const center = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!center) throw `center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`;

    const cohort = await CohortModel.findOne({ name: young.cohort });
    cohort.dateStart.setMinutes(cohort.dateStart.getMinutes() - cohort.dateStart.getTimezoneOffset());
    cohort.dateEnd.setMinutes(cohort.dateEnd.getMinutes() - cohort.dateEnd.getTimezoneOffset());

    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;
    const contacts = service?.contacts.filter((c) => c.cohort === young.cohort) || [];

    const cohortDateStart = new Date(cohort?.dateStart);
    const cohortDateEnd = new Date(cohort?.dateEnd);
    //add 12h to dateStart
    cohortDateStart.setHours(cohortDateStart.getHours() + 12);
    //add 12h to dateEnd
    cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesionLocalService.html"), "utf8");
    return html
      .replace(
        /{{CONTACTS}}/g,
        sanitizeAll(
          contacts
            .map((contact) => {
              return `<li>${contact.contactName} - ${contact.contactPhone || ""} - ${contact.contactMail || ""}</li>`;
            })
            .join(""),
        ),
      )
      .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
      .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
      .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
      .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
      .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
      .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
      .replace(/{{CITY}}/g, sanitizeAll(young.city))
      .replace(
        /{{COHESION_STAY_DATE_STRING}}/g,
        sanitizeAll(datefns.format(cohortDateStart, "dd MMMM", { locale: fr }) + " au " + datefns.format(cohortDateEnd, "dd MMMM yyyy", { locale: fr })),
      )
      .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
      .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
      .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
      .replace(/{{MEETING_DATE}}/g, sanitizeAll(`<b>Le</b> ${datefns.format(cohortDateStart, "EEEE dd MMMM", { locale: fr })}`))
      .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(datefns.format(new Date(cohortDateEnd), "EEEE dd MMMM", { locale: fr })))
      .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
      .replace(/{{TOP}}/g, sanitizeAll(getTop()))
      .replace(/{{BOTTOM}}/g, sanitizeAll(getBottom()))
      .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg()));
  } catch (e) {
    throw e;
  }
};

// todo ⚠️ not updates because no Février 2023⚠️
const renderDOMTOM = async (young) => {
  try {
    if (!["Février 2022", "Juin 2022", "Juillet 2022"].includes(young.cohort)) throw `young ${young.id} unauthorized`;
    if (!young.cohesionCenterId && young.deplacementPhase1Autonomous !== "true") throw `unauthorized`;
    const session = await SessionPhase1.findById(young.sessionPhase1Id);
    if (!session) throw `session ${young.sessionPhase1Id} not found for young ${young._id}`;
    const center = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!center) throw `center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`;
    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;
    const contacts = service?.contacts.filter((c) => c.cohort === young.cohort) || [];

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesionDOMTOM.html"), "utf8");
    return (
      html
        .replace(
          /{{CONTACTS}}/g,
          sanitizeAll(
            contacts
              .map((contact) => {
                return `<li>${contact.contactName} - ${contact.contactPhone} - ${contact.contactMail}</li>`;
              })
              .join(""),
          ),
        )
        .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
        .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
        .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
        .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
        .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
        .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
        .replace(/{{CITY}}/g, sanitizeAll(young.city))
        //.replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(COHESION_STAY_DATE_STRING[young.cohort]))
        .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
        .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
        .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
        .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
        .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
        .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg()))
    );
  } catch (e) {
    throw e;
  }
};

const cohesion = async (young) => {
  // if (isFromDOMTOM(young)) return renderDOMTOM(young);
  if (young?.transportInfoGivenByLocal === "true") return renderLocalTransport(young);
  return render(young);
};

module.exports = { cohesion };

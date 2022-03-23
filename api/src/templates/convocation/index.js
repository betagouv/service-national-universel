/* eslint-disable no-useless-catch */
const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const SessionPhase1 = require("../../models/sessionPhase1");
const MeetingPointModel = require("../../models/meetingPoint");
const BusModel = require("../../models/bus");
const DepartmentServiceModel = require("../../models/departmentService");
const { formatStringDate, formatStringDateTimezoneUTC } = require("snu-lib");

const isFromDOMTOM = (young) => {
  return ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
    young.department,
  );
};

function getBg(template = "default") {
  if (template === "domtom") return getSignedUrl("convocation/convocationCohesionTemplate-DOMTOM.png");
  return getSignedUrl("convocation/convocation_phase1_v2.png");
}

// ! WARNING : Change date also in app/src/scenes/phase1/components/Convocation.js
const departureMeetingDate = {
  2021: "lundi 20 février, 14:00",
  "Février 2022": "dimanche 13 février, 16:00",
};
const returnMeetingDate = {
  2021: "2 juillet, 14:00",
  "Février 2022": "vendredi 25 février, 11:00",
};

const COHESION_STAY_DATE_STRING = {
  2021: "20 février 2021",
  "Février 2022": "13 février 2022",
};

const render = async (young) => {
  const getDepartureMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return departureMeetingDate[young.cohort]; //new Date("2021-06-20T14:30:00.000+00:00");
    return meetingPoint.departureAtString;
  };
  const getReturnMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return returnMeetingDate[young.cohort]; // new Date("2021-07-02T12:00:00.000+00:00");
    return meetingPoint.returnAtString;
  };
  const getMeetingAddress = (meetingPoint, center) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    return meetingPoint.departureAddress;
  };
  try {
    if (young.statusPhase1 !== "AFFECTED") throw `young ${young.id} not affected`;
    if (!young.sessionPhase1Id || (!young.meetingPointId && young.deplacementPhase1Autonomous !== "true")) throw `young ${young.id} unauthorized`;
    const session = await SessionPhase1.findById(young.sessionPhase1Id);
    if (!session) throw `session ${young.sessionPhase1Id} not found for young ${young._id}`;
    const center = await CohesionCenterModel.findById(session.cohesionCenterId);
    if (!center) throw `center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`;
    const meetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const bus = await BusModel.findById(meetingPoint?.busId);
    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;
    const contact = service?.contacts.find((c) => c.cohort === young.cohort) || {};

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesion.html"), "utf8");
    return html
      .replace(/{{REFERENT_NAME}}/g, sanitizeAll(contact?.contactName))
      .replace(/{{REFERENT_PHONE}}/g, sanitizeAll(contact?.contactPhone))
      .replace(/{{REFERENT_MAIL}}/g, sanitizeAll(contact?.contactMail))
      .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
      .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
      .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
      .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
      .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
      .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
      .replace(/{{CITY}}/g, sanitizeAll(young.city))
      .replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(COHESION_STAY_DATE_STRING[young.cohort]))
      .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
      .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
      .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
      .replace(/{{MEETING_DATE}}/g, sanitizeAll(getDepartureMeetingDate(meetingPoint)))
      .replace(/{{MEETING_ADDRESS}}/g, sanitizeAll(getMeetingAddress(meetingPoint, center)))
      .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(getReturnMeetingDate(meetingPoint)))
      .replace(/{{MEETING_ADDRESS_RETURN}}/g, sanitizeAll("au même lieu de rassemblement qu'à l'aller"))
      .replace(/{{TRANPORT}}/g, sanitizeAll(bus ? `<b>Numéro de transport</b> : ${bus.idExcel}` : ""))
      .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
      .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg()));
  } catch (e) {
    throw e;
  }
};

// todo ⚠️ not updates because no Février 2022 ⚠️
const renderDOMTOM = async (young) => {
  try {
    if (young.cohort !== "Février 2022") throw `young ${young.id} unauthorized`;
    if (!young.cohesionCenterId && young.deplacementPhase1Autonomous !== "true") throw `unauthorized`;
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) throw `center ${young.cohesionCenterId} not found for young ${young._id}`;
    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesionDOMTOM.html"), "utf8");
    return html
      .replace(/{{REFERENT_NAME}}/g, sanitizeAll(service?.contactName))
      .replace(/{{REFERENT_PHONE}}/g, sanitizeAll(service?.contactPhone))
      .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
      .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
      .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
      .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
      .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
      .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
      .replace(/{{CITY}}/g, sanitizeAll(young.city))
      .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
      .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
      .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
      .replace(
        /{{MEETING_ADDRESS_DOMTOM}}/g,
        sanitizeAll("Merci de vous présenter impérativement à la date, à l'heure et au lieu qui vous auront été indiqués par votre service régional."),
      )
      .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
      .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg("domtom")));
  } catch (e) {
    throw e;
  }
};

const cohesion = async (young) => {
  if (isFromDOMTOM(young)) return renderDOMTOM(young);
  return render(young);
};

module.exports = { cohesion };

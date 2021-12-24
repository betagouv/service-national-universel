const fs = require("fs");
const path = require("path");
const { getSignedUrl, getBaseUrl } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");
const BusModel = require("../../models/bus");
const DepartmentServiceModel = require("../../models/departmentService");
const { capture } = require("../../sentry");
const { formatStringDate, formatStringDateTimezoneUTC } = require("snu-lib");

const isFromDOMTOM = (young) => {
  return ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
    young.department,
  );
};

function getBg(template = "default") {
  if (template === "domtom") return getSignedUrl("convocation/convocationCohesionTemplate-DOMTOM.png");
  return getSignedUrl("convocation/convocationCohesionTemplate.png");
}

const render = async (young) => {
  const getDepartureMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return "dimanche 20 juin, 16:30"; //new Date("2021-06-20T14:30:00.000+00:00");
    return meetingPoint.departureAtString;
  };
  const getReturnMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return "vendredi 2 juillet, 14:00"; // new Date("2021-07-02T12:00:00.000+00:00");
    return meetingPoint.returnAtString;
  };
  const getMeetingAddress = (meetingPoint, center) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    return meetingPoint.departureAddress;
  };
  try {
    if (!young.cohesionCenterId && young.deplacementPhase1Autonomous !== "true") throw `young ${young.id} unauthorized`;
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) throw `center ${young.cohesionCenterId} not found for young ${young._id}`;
    const meetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const bus = await BusModel.findById(meetingPoint?.busId);
    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesion.html"), "utf8");
    return html
      .replace(/{{REFERENT_NAME}}/g, service?.contactName)
      .replace(/{{REFERENT_PHONE}}/g, service?.contactPhone)
      .replace(/{{DATE}}/g, formatStringDate(Date.now()))
      .replace(/{{FIRST_NAME}}/g, young.firstName)
      .replace(/{{LAST_NAME}}/g, young.lastName)
      .replace(/{{BIRTHDATE}}/g, formatStringDateTimezoneUTC(young.birthdateAt))
      .replace(/{{ADDRESS}}/g, young.address)
      .replace(/{{ZIP}}/g, young.zip)
      .replace(/{{CITY}}/g, young.city)
      .replace(/{{COHESION_CENTER_NAME}}/g, center.name)
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, center.address)
      .replace(/{{COHESION_CENTER_ZIP}}/g, center.zip)
      .replace(/{{COHESION_CENTER_CITY}}/g, center.city)
      .replace(/{{MEETING_DATE}}/g, getDepartureMeetingDate(meetingPoint))
      .replace(/{{MEETING_ADDRESS}}/g, getMeetingAddress(meetingPoint, center))
      .replace(/{{MEETING_DATE_RETURN}}/g, getReturnMeetingDate(meetingPoint))
      .replace(/{{MEETING_ADDRESS_RETURN}}/g, "au même lieu de rassemblement qu'à l'aller")
      .replace(/{{TRANPORT}}/g, bus ? `<b>Numéro de transport</b> : ${bus.idExcel}` : "")
      .replace(/{{BASE_URL}}/g, getBaseUrl())
      .replace(/{{GENERAL_BG}}/g, getBg());
  } catch (e) {
    throw e;
  }
};

const renderDOMTOM = async (young) => {
  try {
    if (!young.cohesionCenterId && young.deplacementPhase1Autonomous !== "true") throw `unauthorized`;
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) throw `center ${young.cohesionCenterId} not found for young ${young._id}`;
    const service = await DepartmentServiceModel.findOne({ department: young?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`;

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesionDOMTOM.html"), "utf8");
    return html
      .replace(/{{REFERENT_NAME}}/g, service?.contactName)
      .replace(/{{REFERENT_PHONE}}/g, service?.contactPhone)
      .replace(/{{DATE}}/g, formatStringDate(Date.now()))
      .replace(/{{FIRST_NAME}}/g, young.firstName)
      .replace(/{{LAST_NAME}}/g, young.lastName)
      .replace(/{{BIRTHDATE}}/g, formatStringDateTimezoneUTC(young.birthdateAt))
      .replace(/{{ADDRESS}}/g, young.address)
      .replace(/{{ZIP}}/g, young.zip)
      .replace(/{{CITY}}/g, young.city)
      .replace(/{{COHESION_CENTER_NAME}}/g, center.name)
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, center.address)
      .replace(/{{COHESION_CENTER_ZIP}}/g, center.zip)
      .replace(/{{COHESION_CENTER_CITY}}/g, center.city)
      .replace(/{{MEETING_ADDRESS_DOMTOM}}/g, "Merci de vous présenter impérativement à la date, à l'heure et au lieu qui vous auront été indiqués par votre service régional.")
      .replace(/{{BASE_URL}}/g, getBaseUrl())
      .replace(/{{GENERAL_BG}}/g, getBg("domtom"));
  } catch (e) {
    throw e;
  }
};

const cohesion = async (young) => {
  if (isFromDOMTOM(young)) return renderDOMTOM(young);
  return render(young);
};

module.exports = { cohesion };

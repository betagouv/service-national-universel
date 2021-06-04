const fs = require("fs");
const path = require("path");
const config = require("../../config");
const { getSignedUrl } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");
const BusModel = require("../../models/bus");
const DepartmentServiceModel = require("../../models/departmentService");
const { capture } = require("../../sentry");

const getBaseUrl = () => {
  if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  return "http://localhost:8080";
};

function getBg() {
  return getSignedUrl("convocation/convocationCohesionTemplate.png");
}

const formatDateFR = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatStringLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const minusHour = (date, h) => {
  if (!date) return "-";
  const d = new Date(date);
  d.setHours(d.getHours() - h);
  return d;
};

const cohesion = async (young) => {
  const getDepartureMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return new Date("2021-06-20T14:30:00.000+00:00");
    return minusHour(meetingPoint.departureAt, 2);
  };
  const getReturnMeetingDate = (meetingPoint) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return new Date("2021-07-02T12:00:00.000+00:00");
    return meetingPoint.returnAt;
  };
  const getMeetingAddress = (meetingPoint, center) => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    return meetingPoint.departureAddress;
  };
  const getReturnMeetingAddress = () => {
    if (young.deplacementPhase1Autonomous === "true") return "";
    return "au lieu";
  };
  try {
    if (!young.cohesionCenterId || young.deplacementPhase1Autonomous !== "true") throw `unauthorized`;
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    if (!center) throw `center ${young.cohesionCenterId} not found for young ${young._id}`;
    const meetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const bus = await BusModel.findById(meetingPoint?.busId);
    const service = await DepartmentServiceModel.findOne({ department: center?.department });
    if (!service) throw `service not found for young ${young._id}, center ${center?._id} in department ${center?.department}`;

    const html = fs.readFileSync(path.resolve(__dirname, "./cohesion.html"), "utf8");
    return html
      .replace(/{{REFERENT_NAME}}/g, service?.contactName)
      .replace(/{{REFERENT_PHONE}}/g, service?.contactPhone)
      .replace(/{{DATE}}/g, formatDateFR(Date.now()))
      .replace(/{{FIRST_NAME}}/g, young.firstName)
      .replace(/{{LAST_NAME}}/g, young.lastName)
      .replace(/{{BIRTHDATE}}/g, formatDateFR(young.birthdateAt))
      .replace(/{{ADDRESS}}/g, young.address)
      .replace(/{{ZIP}}/g, young.zip)
      .replace(/{{CITY}}/g, young.city)
      .replace(/{{COHESION_CENTER_NAME}}/g, center.name)
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, center.address)
      .replace(/{{COHESION_CENTER_ZIP}}/g, center.zip)
      .replace(/{{COHESION_CENTER_CITY}}/g, center.city)
      .replace(/{{MEETING_DATE}}/g, formatStringLongDate(getDepartureMeetingDate(meetingPoint)))
      .replace(/{{MEETING_ADDRESS}}/g, getMeetingAddress(meetingPoint, center))
      .replace(/{{MEETING_DATE_RETURN}}/g, formatStringLongDate(getReturnMeetingDate(meetingPoint)))
      .replace(/{{MEETING_ADDRESS_RETURN}}/g, getReturnMeetingAddress())
      .replace(/{{TRANPORT}}/g, bus ? `<b>Numéro de transport</b> : ${bus.idExcel}` : "")
      .replace(/{{BASE_URL}}/g, getBaseUrl())
      .replace(/{{GENERAL_BG}}/g, getBg());
  } catch (e) {
    throw e;
  }
};

module.exports = { cohesion };

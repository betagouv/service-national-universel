const fs = require("fs");
const path = require("path");
const config = require("../../config");
const { getSignedUrl } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const MeetingPointModel = require("../../models/meetingPoint");
const BusModel = require("../../models/bus");
const { capture } = require("../../sentry");

const getBaseUrl = () => {
  if (config.ENVIRONMENT === "staging") return "https://app-a29a266c-556d-4f95-bc0e-9583a27f3f85.cleverapps.io";
  if (config.ENVIRONMENT === "production") return "https://app-5a3e097d-fdf1-44fa-9172-88ad9d7b2b20.cleverapps.io";
  return "http://localhost:8080";
};

function getBg() {
  return getSignedUrl("convocation/convocationCohesionTemplate.png");
}

const formatDateFR = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR");
};

const cohesion = async (young) => {
  try {
    const center = await CohesionCenterModel.findById(young.cohesionCenterId);
    const meetingPoint = await MeetingPointModel.findById(young.meetingPointId);
    const bus = await BusModel.findById(meetingPoint?.busId);
    const html = fs.readFileSync(path.resolve(__dirname, "./cohesion.html"), "utf8");
    return html
      .replace(/{{DATE}}/g, formatDateFR(Date.now()))
      .replace(/{{FIRST_NAME}}/g, young.firstName)
      .replace(/{{LAST_NAME}}/g, young.lastName)
      .replace(/{{BIRTHDATE}}/g, formatDateFR(young.birthdateAt))
      .replace(/{{ADDRESS}}/g, young.address)
      .replace(/{{ZIP}}/g, young.zip)
      .replace(/{{CITY}}/g, young.city)
      .replace(/{{COHESION_CENTER_NAME}}/g, young.cohesionCenterName)
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, center.address)
      .replace(/{{COHESION_CENTER_ZIP}}/g, young.cohesionCenterZip)
      .replace(/{{COHESION_CENTER_CITY}}/g, young.cohesionCenterCity)
      .replace(/{{MEETING_DATE}}/g, formatDateFR(meetingPoint.departureAt))
      .replace(/{{MEETING_ADDRESS}}/g, meetingPoint.departureAddress)
      .replace(/{{MEETING_DATE_RETURN}}/g, formatDateFR(meetingPoint.returnAt))
      .replace(/{{BUS}}/g, bus.idExcel)
      .replace(/{{BASE_URL}}/g, getBaseUrl())
      .replace(/{{GENERAL_BG}}/g, getBg());
  } catch (e) {
    capture(e);
  }
};

module.exports = { cohesion };

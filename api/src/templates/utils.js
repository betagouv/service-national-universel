const certificate = require("./certificate");
const form = require("./form");
const convocation = require("./convocation");
const contractPhase2 = require("./contractPhase2");
const droitImage = require("./droitImage");

async function getHtmlTemplate(type, template, young, contract) {
  if (type === "certificate" && template === "1") return await certificate.phase1(young);
  if (type === "certificate" && template === "2") return certificate.phase2(young);
  if (type === "certificate" && template === "3") return certificate.phase3(young);
  if (type === "certificate" && template === "snu") return certificate.snu(young);
  if (type === "form" && template === "imageRight") return form.imageRight(young);
  if (type === "convocation" && template === "cohesion") return convocation.cohesion(young);
  if (type === "contract" && template === "2" && contract) return contractPhase2.render(contract);
  if (type === "droitImage" && template === "droitImage") return droitImage.render(young);
}

async function getDepartureDate(meetingPoint, session, young, cohort, regionsListDROMS) {
  if (meetingPoint?.departuredDate) {
    return new Date(meetingPoint?.departuredDate);
  }
  if (session?.dateStart) {
    const sessionDateStart = new Date(session.dateStart);
    sessionDateStart.setHours(sessionDateStart.getHours() + 12);
    return sessionDateStart;
  }
  if (young.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 4);
  }
  const cohortDateStart = new Date(cohort?.dateStart);
  cohortDateStart.setHours(cohortDateStart.getHours() + 12);
  return new Date(cohortDateStart);
}

async function getReturnDate(meetingPoint, session, young, cohort, regionsListDROMS) {
  if (meetingPoint?.returnDate) {
    return new Date(meetingPoint?.returnDate);
  }
  if (session?.dateEnd) {
    const sessionDateEnd = new Date(session.dateEnd);
    sessionDateEnd.setHours(sessionDateEnd.getHours() + 12);
    return sessionDateEnd;
  }
  if (young?.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 16);
  }
  const cohortDateEnd = new Date(cohort?.dateEnd);
  cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);
  return new Date(cohortDateEnd);
}

module.exports = {
  getHtmlTemplate,
  getDepartureDate,
  getReturnDate,
};

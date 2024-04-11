/* eslint-disable no-useless-catch */
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
require("dayjs/locale/fr");

const { capture } = require("../../sentry");

const { getSignedUrl, getBaseUrl, sanitizeAll } = require("../../utils");
const CohesionCenterModel = require("../../models/cohesionCenter");
const SessionPhase1 = require("../../models/sessionPhase1");
const CohortModel = require("../../models/cohort");
const { getDepartureDateSession, getReturnDateSession } = require("../../utils/cohort");

const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");

const DepartmentServiceModel = require("../../models/departmentService");
const { formatStringDate, formatStringDateTimezoneUTC, regionsListDROMS, transportDatesToString } = require("snu-lib");

const datefns = require("date-fns");
var { fr } = require("date-fns/locale");

function getBg() {
  return getSignedUrl("convocation/convocation_template_base_2024_V2.png");
}
function getTop() {
  return getSignedUrl("convocation/top_V2.png");
}
function getBottom() {
  return getSignedUrl("convocation/bottom.png");
}
function getBGForNc() {
  return getSignedUrl("convocation/convocation_template_base_NC.png");
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
    if (!young.sessionPhase1Id || (!young.meetingPointId && young.deplacementPhase1Autonomous !== "true" && young.source !== "CLE")) throw `young ${young.id} unauthorized`;
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
    const departureDate = getDepartureDateSession(session, young, cohort);
    const returnDate = getReturnDateSession(session, young, cohort);
    if (young.source === "CLE") {
      const html = fs.readFileSync(path.resolve(__dirname, "./cohesion-CLE.html"), "utf8");
      return html
        .replace(/{{DATE}}/g, sanitizeAll(formatStringDate(Date.now())))
        .replace(/{{FIRST_NAME}}/g, sanitizeAll(young.firstName))
        .replace(/{{LAST_NAME}}/g, sanitizeAll(young.lastName))
        .replace(/{{BIRTHDATE}}/g, sanitizeAll(formatStringDateTimezoneUTC(young.birthdateAt)))
        .replace(/{{ADDRESS}}/g, sanitizeAll(young.address))
        .replace(/{{ZIP}}/g, sanitizeAll(young.zip))
        .replace(/{{CITY}}/g, sanitizeAll(young.city))
        .replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(transportDatesToString(departureDate, returnDate)))
        .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
        .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
        .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
        .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
        .replace(/{{MEETING_DATE}}/g, sanitizeAll("<b>Le</b> " + dayjs(departureDate).locale("fr-FR").format("dddd DD MMMM YYYY")))
        .replace(/{{MEETING_HOURS}}/g, sanitizeAll(`<b>A</b> ${meetingPoint ? ligneToPoint.meetingHour : "16:00"}`))
        .replace(/{{MEETING_ADDRESS}}/g, sanitizeAll(`<b>Au</b> ${getMeetingAddress(meetingPoint, center)}`))
        .replace(/{{TRANSPORT}}/g, sanitizeAll(ligneBus ? `<b>Numéro de transport</b> : ${ligneBus.busId}` : ""))
        .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(dayjs(returnDate).locale("fr").format("dddd DD MMMM YYYY")))
        .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
        .replace(/{{TOP}}/g, sanitizeAll(getTop()))
        .replace(/{{BOTTOM}}/g, sanitizeAll(getBottom()))
        .replace(/{{GENERAL_BG}}/g, sanitizeAll(getBg()))
        .replace(
          /{{LUNCH_BREAK}}/g,
          sanitizeAll(
            ligneBus?.lunchBreak ? `<li>une collation ou un déjeuner froid selon la durée de votre trajet entre le lieu de rassemblement et le centre du séjour.</li>` : "",
          ),
        );
    } else {
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
        .replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(transportDatesToString(departureDate, returnDate)))
        .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
        .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
        .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
        .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
        .replace(/{{MEETING_DATE}}/g, sanitizeAll("<b>Le</b> " + dayjs(departureDate).locale("fr-FR").format("dddd DD MMMM YYYY")))
        .replace(/{{MEETING_HOURS}}/g, sanitizeAll(`<b>A</b> ${meetingPoint ? ligneToPoint.meetingHour : "16:00"}`))
        .replace(/{{MEETING_ADDRESS}}/g, sanitizeAll(`<b>Au</b> ${getMeetingAddress(meetingPoint, center)}`))
        .replace(/{{TRANSPORT}}/g, sanitizeAll(ligneBus ? `<b>Numéro de transport</b> : ${ligneBus.busId}` : ""))
        .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(dayjs(returnDate).locale("fr").format("dddd DD MMMM YYYY")))
        .replace(/{{MEETING_HOURS_RETURN}}/g, sanitizeAll(meetingPoint ? ligneToPoint.returnHour : "11:00"))
        .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
        .replace(/{{TOP}}/g, sanitizeAll(getTop()))
        .replace(/{{BOTTOM}}/g, sanitizeAll(getBottom()))
        .replace(/{{GENERAL_BG}}/g, sanitizeAll(young.cohort === "Octobre 2023 - NC" ? getBGForNc() : getBg()))
        .replace(
          /{{LUNCH_BREAK}}/g,
          sanitizeAll(
            ligneBus?.lunchBreak ? `<li>une collation ou un déjeuner froid selon la durée de votre trajet entre le lieu de rassemblement et le centre du séjour.</li>` : "",
          ),
        );
    }
  } catch (e) {
    capture(e);
    throw e;
  }
};

const renderLocalTransport = async (young) => {
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

    const departureDate = () => {
      if (session.dateStart) {
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
    };

    const returnDate = () => {
      if (session.dateEnd) {
        const sessionDateEnd = new Date(session.dateEnd);
        sessionDateEnd.setHours(sessionDateEnd.getHours() + 12);
        return sessionDateEnd;
      }
      if (young.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
        return new Date(2023, 6, 16);
      }
      const cohortDateEnd = new Date(cohort?.dateEnd);
      cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);
      return new Date(cohortDateEnd);
    };

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
      .replace(/{{COHESION_STAY_DATE_STRING}}/g, sanitizeAll(transportDatesToString(departureDate(), returnDate())))
      .replace(/{{COHESION_CENTER_NAME}}/g, sanitizeAll(center.name))
      .replace(/{{COHESION_CENTER_ADDRESS}}/g, sanitizeAll(center.address))
      .replace(/{{COHESION_CENTER_ZIP}}/g, sanitizeAll(center.zip))
      .replace(/{{COHESION_CENTER_CITY}}/g, sanitizeAll(center.city))
      .replace(/{{MEETING_DATE}}/g, sanitizeAll(`<b>Le</b> ${datefns.format(departureDate(), "EEEE dd MMMM", { locale: fr })}`))
      .replace(/{{MEETING_DATE_RETURN}}/g, sanitizeAll(datefns.format(new Date(returnDate()), "EEEE dd MMMM", { locale: fr })))
      .replace(/{{BASE_URL}}/g, sanitizeAll(getBaseUrl()))
      .replace(/{{TOP}}/g, sanitizeAll(getTop()))
      .replace(/{{BOTTOM}}/g, sanitizeAll(getBottom()))
      .replace(/{{GENERAL_BG}}/g, sanitizeAll(young.cohort === "Octobre 2023 - NC" ? getBGForNc() : getBg()));
  } catch (e) {
    capture(e);
    throw e;
  }
};

const cohesion = async (young) => {
  if (young?.transportInfoGivenByLocal === "true" && young.source !== "CLE") return renderLocalTransport(young);
  return render(young);
};

module.exports = { cohesion };

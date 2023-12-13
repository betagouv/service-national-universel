const { SENDINBLUE_TEMPLATES, MISSION_STATUS, APPLICATION_STATUS } = require("snu-lib");
const { deletePatches } = require("../../Infrastructure/Controllers/patches");
const ApplicationModel = require("../../Infrastructure/Databases/Mongo/Models/application");
const YoungModel = require("../../Infrastructure/Databases/Mongo/Models/young");
const ReferentModel = require("../../Infrastructure/Databases/Mongo/Models/referent");
const { sendTemplate } = require("../../Infrastructure/Services/sendinblue");
const { APP_URL } = require("../../Infrastructure/Config/config");
const { getCcOfYoung } = require("../Utils");
const { getTutorName } = require("./mission");
const { capture } = require("../../Infrastructure/Services/sentry");

const anonymizeApplicationsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }) => {
  try {
    const applications = await ApplicationModel.find({ youngId });

    console.log("ANONYMIZE YOUNGS APPLICATIONS >>>", `${applications.length} applications found for young with id ${youngId}.`);

    if (!applications.length) {
      return;
    }

    for (const application of applications) {
      application.set({
        youngFirstName: anonymizedYoung.firstName,
        youngLastName: anonymizedYoung.lastName,
        youngEmail: anonymizedYoung.email,
        youngBirthdateAt: anonymizedYoung.birthdateAt,
        youngCity: anonymizedYoung.city,
        youngDepartment: anonymizedYoung.department,
        contractStatus: application.contractStatus || "DRAFT",
      });
      await application.save();
      const deletePatchesResult = await deletePatches({ id: application._id.toString(), model: ApplicationModel });
      if (!deletePatchesResult.ok) {
        console.error(`ERROR deleting patches of application with id ${application._id} >>>`, deletePatchesResult.code);
      }
    }

    console.log("ANONYMIZE YOUNGS APPLICATIONS >>>", `${applications.length} applications anonymized for young with id ${youngId}.`);
  } catch (e) {
    console.log("Error while anonymizing youngs applications", e);
    capture(e);
  }
};

const updateApplicationTutor = async (mission, fromUser = null) => {
  try {
    const applications = await ApplicationModel.find({
      missionId: mission._id,
    });

    for (let application of applications) {
      if (application.tutorId !== mission.tutorId) {
        const tutor = await ReferentModel.findById(mission.tutorId);
        application.set({ tutorId: mission.tutorId, tutorName: getTutorName(tutor) });
        await application.save({ fromUser });
      }
    }
  } catch (e) {
    console.log("Error while updating application tutor", e);
    capture(e);
  }
};

const updateApplicationStatus = async (mission, fromUser = null) => {
  try {
    if (![MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED, MISSION_STATUS.REFUSED].includes(mission.status))
      return console.log(`no need to update applications, new status for mission ${mission._id} is ${mission.status}`);
    const applications = await ApplicationModel.find({
      missionId: mission._id,
      status: {
        $in: [
          APPLICATION_STATUS.WAITING_VALIDATION,
          APPLICATION_STATUS.WAITING_ACCEPTATION,
          APPLICATION_STATUS.WAITING_VERIFICATION,
          // APPLICATION_STATUS.VALIDATED,
          // APPLICATION_STATUS.IN_PROGRESS,
        ],
      },
    });
    for (let application of applications) {
      let cta = `${APP_URL}/phase2`;
      let statusComment = "";
      let sendinblueTemplate = "";
      switch (mission.status) {
        case MISSION_STATUS.REFUSED:
          statusComment = "La mission n'est plus disponible.";
          break;
        case MISSION_STATUS.CANCEL:
          statusComment = "La mission a été annulée.";
          sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_CANCEL;
          cta = `${APP_URL}/phase2?utm_campaign=transactionnel+mig+annulee&utm_source=notifauto&utm_medium=mail+261+acceder`;
          break;
        case MISSION_STATUS.ARCHIVED:
          statusComment = "La mission a été archivée.";
          sendinblueTemplate = SENDINBLUE_TEMPLATES.young.MISSION_ARCHIVED;
          break;
      }
      application.set({ status: APPLICATION_STATUS.CANCEL, statusComment });
      await application.save({ fromUser });

      // ! Should update contract too if it exists

      if (sendinblueTemplate) {
        const young = await YoungModel.findById(application.youngId);
        let cc = getCcOfYoung({ template: sendinblueTemplate, young });

        await sendTemplate(sendinblueTemplate, {
          emailTo: [{ name: `${application.youngFirstName} ${application.youngLastName}`, email: application.youngEmail }],
          params: {
            cta,
            missionName: mission.name,
            message: mission.statusComment,
          },
          cc,
        });
      }
    }
  } catch (e) {
    console.log("Error while updating application status", e);
    capture(e);
  }
};

module.exports = {
  anonymizeApplicationsFromYoungId,
  updateApplicationTutor,
  updateApplicationStatus,
};

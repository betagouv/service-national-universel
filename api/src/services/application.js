const { deletePatches } = require("../controllers/patches");
const ApplicationModel = require("../models/application");

const anonymizeApplicationsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }) => {
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
};

module.exports = {
  anonymizeApplicationsFromYoungId,
};

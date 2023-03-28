const { deletePatches } = require("../controllers/patches");
const ApplicationModel = require("../models/application");

const anonymizeApplicationsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }) => {
  const applications = await ApplicationModel.find({ youngId });

  for (const application of applications) {
    application.set({
      youngFirstName: anonymizedYoung.firstName,
      youngLastName: anonymizedYoung.lastName,
      youngEmail: anonymizedYoung.email,
      youngBirthdateAt: anonymizedYoung.birthdateAt,
      youngCity: anonymizedYoung.city,
      youngDepartment: anonymizedYoung.department,
    });
    await application.save();
    const deletePatchesResult = await deletePatches({ id: application._id.toString(), model: ApplicationModel });
    if (!deletePatchesResult.ok) {
      console.error(`ERROR deleting patches of application with id ${application._id} >>>`, deletePatchesResult.code);
    }
  }
};

module.exports = {
  anonymizeApplicationsFromYoungId,
};

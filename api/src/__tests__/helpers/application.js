const ApplicationObject = require("../../models/application");

async function createApplication(application) {
  return await ApplicationObject.create(application);
}

async function getApplicationsHelper(params = {}) {
  return await ApplicationObject.find(params);
}

async function deleteApplicationHelper() {
  return await ApplicationObject.deleteMany({});
}

async function getApplicationByIdHelper(applicationId) {
  return await ApplicationObject.findOne({ _id: applicationId });
}

const notExistingApplicationId = "104a49ba503040e4d8853973";

module.exports = {
  createApplication,
  getApplicationsHelper,
  deleteApplicationHelper,
  notExistingApplicationId,
  getApplicationByIdHelper,
};

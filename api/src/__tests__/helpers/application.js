const { ApplicationModel } = require("../../models");

async function createApplication(application) {
  return await ApplicationModel.create(application);
}

async function getApplicationsHelper(params = {}) {
  return await ApplicationModel.find(params);
}

async function deleteApplicationHelper() {
  return await ApplicationModel.deleteMany({});
}

async function getApplicationByIdHelper(applicationId) {
  return await ApplicationModel.findById(applicationId);
}

const notExistingApplicationId = "104a49ba503040e4d8853973";

module.exports = {
  createApplication,
  getApplicationsHelper,
  deleteApplicationHelper,
  notExistingApplicationId,
  getApplicationByIdHelper,
};

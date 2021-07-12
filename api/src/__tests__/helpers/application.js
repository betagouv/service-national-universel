const ApplicationObject = require("../../models/application");

async function createApplication(application) {
  return await ApplicationObject.create(application);
}

async function getApplicationsHelper(params = {}) {
  return await ApplicationObject.find(params);
}

module.exports = {
  createApplication,
  getApplicationsHelper,
};

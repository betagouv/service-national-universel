const BusObject = require("../../models/bus");

async function getBusesHelper() {
  return await BusObject.find({});
}

async function getBusByIdHelper(id) {
  return await BusObject.findById(id);
}

async function createBusHelper(Bus) {
  return await BusObject.create(Bus);
}

const notExistingBusId = "104a49ba503555e4d8853973";

module.exports = {
  getBusesHelper,
  getBusByIdHelper,
  createBusHelper,
  notExistingBusId,
};

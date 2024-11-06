import { BusModel } from "../../models";

async function getBusesHelper() {
  return await BusModel.find({});
}

async function getBusByIdHelper(id) {
  return await BusModel.findById(id);
}

async function createBusHelper(Bus) {
  return await BusModel.create(Bus);
}

const notExistingBusId = "104a49ba503555e4d8853973";

export { getBusesHelper, getBusByIdHelper, createBusHelper, notExistingBusId };

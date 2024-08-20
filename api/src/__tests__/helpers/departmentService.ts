import { DepartmentServiceModel } from "../../models";

async function getDepartmentServicesHelper() {
  return await DepartmentServiceModel.find({});
}

async function getDepartmentServiceByIdHelper(id) {
  return await DepartmentServiceModel.findById(id);
}

async function deleteDepartmentServiceByIdHelper(id) {
  const departmentService = await getDepartmentServiceByIdHelper(id);
  await departmentService?.remove();
}

async function deleteAllDepartmentServicesHelper() {
  await DepartmentServiceModel.deleteMany({});
}

async function createDepartmentServiceHelper(departmentService) {
  return await DepartmentServiceModel.create(departmentService);
}

function expectDepartmentServiceToEqual(departmentService, expectedDepartmentService) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const departmentServiceParsed = JSON.parse(JSON.stringify(departmentService));
  const expectedDepartmentServiceParsed = JSON.parse(JSON.stringify(expectedDepartmentService));
  expect(departmentServiceParsed.department).toEqual(expectedDepartmentServiceParsed.department);
  expect(departmentServiceParsed.region).toEqual(expectedDepartmentServiceParsed.region);
  expect(departmentServiceParsed.directionName).toEqual(expectedDepartmentServiceParsed.directionName);
  expect(departmentServiceParsed.serviceName).toEqual(expectedDepartmentServiceParsed.serviceName);
  expect(departmentServiceParsed.serviceNumber).toEqual(expectedDepartmentServiceParsed.serviceNumber);
  expect(departmentServiceParsed.address).toEqual(expectedDepartmentServiceParsed.address);
  expect(departmentServiceParsed.complementAddress).toEqual(expectedDepartmentServiceParsed.complementAddress);
  expect(departmentServiceParsed.zip).toEqual(expectedDepartmentServiceParsed.zip);
  expect(departmentServiceParsed.city).toEqual(expectedDepartmentServiceParsed.city);
  expect(departmentServiceParsed.description).toEqual(expectedDepartmentServiceParsed.description);
}

export {
  getDepartmentServicesHelper,
  getDepartmentServiceByIdHelper,
  deleteDepartmentServiceByIdHelper,
  createDepartmentServiceHelper,
  expectDepartmentServiceToEqual,
  deleteAllDepartmentServicesHelper,
};

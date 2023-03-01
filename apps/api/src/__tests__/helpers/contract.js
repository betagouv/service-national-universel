const ContractObject = require("../../models/contract");

async function getContractsHelper(params = {}) {
  return await ContractObject.find(params);
}

async function getContractByIdHelper(contractId) {
  return await ContractObject.findById(contractId);
}

async function deleteContractByIdHelper(contractId) {
  const contract = await getContractByIdHelper(contractId);
  await contract.remove();
}

async function createContractHelper(contract) {
  return await ContractObject.create(contract);
}

function expectContractToEqual(contract, expectedContract) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const contractParsed = JSON.parse(JSON.stringify(contract));
  const expectedContractParsed = JSON.parse(JSON.stringify(expectedContract));
  expect(contractParsed.youngId).toEqual(expectedContractParsed.youngId);
  expect(contractParsed.structureId).toEqual(expectedContractParsed.structureId);
  expect(contractParsed.applicationId).toEqual(expectedContractParsed.applicationId);
  expect(contractParsed.missionId).toEqual(expectedContractParsed.missionId);
  expect(contractParsed.tutorId).toEqual(expectedContractParsed.tutorId);
  expect(contractParsed.isYoungAdult).toEqual(expectedContractParsed.isYoungAdult);
  expect(contractParsed.youngFirstName).toEqual(expectedContractParsed.youngFirstName);
  expect(contractParsed.youngLastName).toEqual(expectedContractParsed.youngLastName);
  expect(contractParsed.youngBirthdate).toEqual(expectedContractParsed.youngBirthdate);
  expect(contractParsed.youngAddress).toEqual(expectedContractParsed.youngAddress);
  expect(contractParsed.youngCity).toEqual(expectedContractParsed.youngCity);
  expect(contractParsed.youngDepartment).toEqual(expectedContractParsed.youngDepartment);
  expect(contractParsed.youngEmail).toEqual(expectedContractParsed.youngEmail);
  expect(contractParsed.youngPhone).toEqual(expectedContractParsed.youngPhone);
  expect(contractParsed.parent1FirstName).toEqual(expectedContractParsed.parent1FirstName);
  expect(contractParsed.parent1LastName).toEqual(expectedContractParsed.parent1LastName);
  expect(contractParsed.parent1Address).toEqual(expectedContractParsed.parent1Address);
  expect(contractParsed.parent1City).toEqual(expectedContractParsed.parent1City);
  expect(contractParsed.parent1Department).toEqual(expectedContractParsed.parent1Department);
  expect(contractParsed.parent1Phone).toEqual(expectedContractParsed.parent1Phone);
  expect(contractParsed.parent1Email).toEqual(expectedContractParsed.parent1Email);
  expect(contractParsed.parent2FirstName).toEqual(expectedContractParsed.parent2FirstName);
  expect(contractParsed.parent2LastName).toEqual(expectedContractParsed.parent2LastName);
  expect(contractParsed.parent2Address).toEqual(expectedContractParsed.parent2Address);
  expect(contractParsed.parent2City).toEqual(expectedContractParsed.parent2City);
  expect(contractParsed.parent2Department).toEqual(expectedContractParsed.parent2Department);
  expect(contractParsed.parent2Phone).toEqual(expectedContractParsed.parent2Phone);
  expect(contractParsed.parent2Email).toEqual(expectedContractParsed.parent2Email);
  expect(contractParsed.missionName).toEqual(expectedContractParsed.missionName);
  expect(contractParsed.missionObjective).toEqual(expectedContractParsed.missionObjective);
  expect(contractParsed.missionAction).toEqual(expectedContractParsed.missionAction);
  expect(contractParsed.missionStartAt).toEqual(expectedContractParsed.missionStartAt);
  expect(contractParsed.missionEndAt).toEqual(expectedContractParsed.missionEndAt);
  expect(contractParsed.missionAddress).toEqual(expectedContractParsed.missionAddress);
  expect(contractParsed.missionCity).toEqual(expectedContractParsed.missionCity);
  expect(contractParsed.missionZip).toEqual(expectedContractParsed.missionZip);
  expect(contractParsed.missionDuration).toEqual(expectedContractParsed.missionDuration);
  expect(contractParsed.missionFrequence).toEqual(expectedContractParsed.missionFrequence);
  expect(contractParsed.date).toEqual(expectedContractParsed.date);
  expect(contractParsed.projectManagerFirstName).toEqual(expectedContractParsed.projectManagerFirstName);
  expect(contractParsed.projectManagerLastName).toEqual(expectedContractParsed.projectManagerLastName);
  expect(contractParsed.projectManagerRole).toEqual(expectedContractParsed.projectManagerRole);
  expect(contractParsed.projectManagerEmail).toEqual(expectedContractParsed.projectManagerEmail);
  expect(contractParsed.structureManagerFirstName).toEqual(expectedContractParsed.structureManagerFirstName);
  expect(contractParsed.structureManagerLastName).toEqual(expectedContractParsed.structureManagerLastName);
  expect(contractParsed.structureManagerEmail).toEqual(expectedContractParsed.structureManagerEmail);
  expect(contractParsed.structureManagerRole).toEqual(expectedContractParsed.structureManagerRole);
  expect(contractParsed.structureSiret).toEqual(expectedContractParsed.structureSiret);
  expect(contractParsed.structureName).toEqual(expectedContractParsed.structureName);
}

module.exports = {
  getContractsHelper,
  getContractByIdHelper,
  deleteContractByIdHelper,
  createContractHelper,
  expectContractToEqual,
};

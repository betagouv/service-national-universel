const StructureObject = require("../../models/structure");

async function getStructuresHelper() {
  return await StructureObject.find({});
}

async function getStructureByIdHelper(structureId) {
  return await StructureObject.findById(structureId);
}

async function deleteStructureByIdHelper(structureId) {
  const structure = await getStructureByIdHelper(structureId);
  if (structure) await structure.remove();
}

async function createStructureHelper(mission) {
  return await StructureObject.create(mission);
}

function expectStructureToEqual(structure, expectedStructure) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const structureParsed = JSON.parse(JSON.stringify(structure));
  const expectedStructureParsed = JSON.parse(JSON.stringify(expectedStructure));
  expect(structureParsed.name).toEqual(expectedStructureParsed.name);
  expect(structureParsed.description).toEqual(expectedStructureParsed.description);
  expect(structureParsed.address).toEqual(expectedStructureParsed.address);
  expect(structureParsed.zip).toEqual(expectedStructureParsed.zip);
  expect(structureParsed.city).toEqual(expectedStructureParsed.city);
  expect(structureParsed.department).toEqual(expectedStructureParsed.department);
  expect(structureParsed.region).toEqual(expectedStructureParsed.region);
  expect(structureParsed.country).toEqual(expectedStructureParsed.country);
  expect(structureParsed.location.lat).toEqual(expectedStructureParsed.location.lat);
  expect(structureParsed.location.lon).toEqual(expectedStructureParsed.location.lon);
  expect(structureParsed.state).toEqual(expectedStructureParsed.state);
  expect(structureParsed.structurePriveeType).toEqual(expectedStructureParsed.structurePriveeType);
  expect(structureParsed.structurePubliqueEtatType).toEqual(expectedStructureParsed.structurePubliqueEtatType);
  expect(structureParsed.structurePubliqueType).toEqual(expectedStructureParsed.structurePubliqueType);
  expect(structureParsed.associationTypes).toEqual(expectedStructureParsed.associationTypes);
  expect(structureParsed.legalStatus).toEqual(expectedStructureParsed.legalStatus);
  expect(structureParsed.networkId).toEqual(expectedStructureParsed.networkId);
  expect(structureParsed.networkName).toEqual(expectedStructureParsed.networkName);
  expect(structureParsed.isNetwork).toEqual(expectedStructureParsed.isNetwork);
  expect(structureParsed.status).toEqual(expectedStructureParsed.status);
  expect(structureParsed.instagram).toEqual(expectedStructureParsed.instagram);
  expect(structureParsed.twitter).toEqual(expectedStructureParsed.twitter);
  expect(structureParsed.facebook).toEqual(expectedStructureParsed.facebook);
  expect(structureParsed.website).toEqual(expectedStructureParsed.website);
  expect(structureParsed.siret).toEqual(expectedStructureParsed.siret);
}

const notExistingStructureId = "104a49ba503040e4d2153973";

module.exports = {
  getStructuresHelper,
  getStructureByIdHelper,
  deleteStructureByIdHelper,
  createStructureHelper,
  expectStructureToEqual,
  notExistingStructureId,
};

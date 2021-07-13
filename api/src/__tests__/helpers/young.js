const YoungObject = require("../../models/young");

async function getYoungsHelper() {
  return await YoungObject.find({});
}

async function getYoungByIdHelper(youngId) {
  return await YoungObject.findOne({ _id: youngId });
}

async function deleteYoungByIdHelper(youngId) {
  const young = await getYoungByIdHelper(youngId);
  await young.remove();
}

async function deleteYoungByEmailHelper(email) {
  const young = await YoungObject.findOne({ email });
  await young.remove();
}

async function createYoungHelper(young) {
  return await YoungObject.create(young);
}

function expectYoungToEqual(young, expectedYoung) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const youngParsed = JSON.parse(JSON.stringify(young));
  const expectedYoungParsed = JSON.parse(JSON.stringify(expectedYoung));
  expect(youngParsed.region).toEqual(expectedYoungParsed.region);
  expect(youngParsed.department).toEqual(expectedYoungParsed.department);
  expect(youngParsed.firstName).toEqual(expectedYoungParsed.firstName);
  expect(youngParsed.lastName).toEqual(expectedYoungParsed.lastName);
  expect(youngParsed.email).toEqual(expectedYoungParsed.email);
  expect(youngParsed.phone).toEqual(expectedYoungParsed.phone);
  expect(youngParsed.birthCountry).toEqual(expectedYoungParsed.birthCountry);
  expect(youngParsed.zip).toEqual(expectedYoungParsed.zip);
  expect(youngParsed.city).toEqual(expectedYoungParsed.city);
  expect(youngParsed.cityCode).toEqual(expectedYoungParsed.cityCode);
  expect(youngParsed.gender).toEqual(expectedYoungParsed.gender);
}

const notExistingYoungId = "104a49ba503040e4d2153973";

module.exports = {
  getYoungsHelper,
  getYoungByIdHelper,
  deleteYoungByIdHelper,
  createYoungHelper,
  expectYoungToEqual,
  deleteYoungByEmailHelper,
  notExistingYoungId,
};

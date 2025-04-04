import { YoungModel } from "../../models";

async function getYoungsHelper() {
  return await YoungModel.find({});
}

async function getYoungByIdHelper(youngId) {
  return await YoungModel.findById(youngId);
}

async function deleteYoungByIdHelper(youngId) {
  const young = await getYoungByIdHelper(youngId);
  if (young) await young.deleteOne();
}

async function deleteYoungByEmailHelper(email) {
  const young = await YoungModel.findOne({ email });
  if (young) await young.deleteOne();
}

async function createYoungHelper(young) {
  return await YoungModel.create(young);
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

export { getYoungsHelper, getYoungByIdHelper, deleteYoungByIdHelper, createYoungHelper, expectYoungToEqual, deleteYoungByEmailHelper, notExistingYoungId };

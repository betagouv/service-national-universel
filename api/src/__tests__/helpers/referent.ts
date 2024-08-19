import { ReferentModel } from "../../models";

async function getReferentsHelper() {
  return await ReferentModel.find({});
}

async function getReferentByIdHelper(referentId) {
  return await ReferentModel.findById(referentId);
}

async function deleteReferentByIdHelper(referentId) {
  const referent = await getReferentByIdHelper(referentId);
  await referent?.remove();
}

async function deleteAllReferentBySubrole(subRole) {
  const referents = await ReferentModel.find({ subRole: subRole });
  for (const referent of referents) {
    await deleteReferentByIdHelper(referent._id);
  }
}

async function createReferentHelper(referent) {
  return await ReferentModel.create(referent);
}

function expectReferentToEqual(referent, expectedReferent) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const referentParsed = JSON.parse(JSON.stringify(referent));
  const expectedReferentParsed = JSON.parse(JSON.stringify(expectedReferent));
  expect(referentParsed.region).toEqual(expectedReferent.region);
  expect(referentParsed.department).toEqual(expectedReferentParsed.department);
  expect(referentParsed.firstName).toEqual(expectedReferentParsed.firstName);
  expect(referentParsed.lastName).toEqual(expectedReferentParsed.lastName);
  expect(referentParsed.email).toEqual(expectedReferentParsed.email);
  expect(referentParsed.phone).toEqual(expectedReferentParsed.phone);
  expect(referentParsed.mobile).toEqual(expectedReferentParsed.mobile);
  expect(referentParsed.role).toEqual(expectedReferentParsed.role);
}

const notExistingReferentId = "104a49ba503040e4d2177973";

export { getReferentsHelper, getReferentByIdHelper, deleteReferentByIdHelper, createReferentHelper, expectReferentToEqual, notExistingReferentId, deleteAllReferentBySubrole };

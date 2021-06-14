const ReferentObject = require("../../models/referent");

async function getReferentsHelper() {
  return await ReferentObject.find({});
}

async function getReferentByEmailHelper(referentEmail) {
  return await ReferentObject.findOne({ email: referentEmail });
}

async function deleteReferentByEmailHelper(referentEmail) {
  const referent = await getReferentByEmailHelper(referentEmail);
  await referent.remove();
}

async function createReferentHelper(referent) {
  return await ReferentObject.create(referent);
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

module.exports = {
  getReferentsHelper,
  getReferentByEmailHelper,
  deleteReferentByEmailHelper,
  createReferentHelper,
  expectReferentToEqual,
};

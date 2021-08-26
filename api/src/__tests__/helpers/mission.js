const MissionObject = require("../../models/mission");

async function getMissionsHelper(params = {}) {
  return await MissionObject.find(params);
}

async function getMissionByIdHelper(missionId) {
  return await MissionObject.findById(missionId);
}

async function deleteMissionByIdHelper(missionId) {
  const mission = await getMissionByIdHelper(missionId);
  await mission.remove();
}

async function createMissionHelper(mission) {
  return await MissionObject.create(mission);
}

function expectMissionToEqual(mission, expectedMission) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const missionParsed = JSON.parse(JSON.stringify(mission));
  const expectedMissionParsed = JSON.parse(JSON.stringify(expectedMission));
  expect(missionParsed.name).toEqual(expectedMissionParsed.name);
  expect(missionParsed.startAt).toEqual(expectedMissionParsed.startAt);
  expect(missionParsed.endAt).toEqual(expectedMissionParsed.endAt);
  expect(missionParsed.placesTotal).toEqual(expectedMissionParsed.placesTotal);
  expect(missionParsed.placesLeft).toEqual(expectedMissionParsed.placesLeft);
  expect(missionParsed.actions).toEqual(expectedMissionParsed.actions);
  expect(missionParsed.description).toEqual(expectedMissionParsed.description);
  expect(missionParsed.justifications).toEqual(expectedMissionParsed.justifications);
  expect(missionParsed.contraintes).toEqual(expectedMissionParsed.contraintes);
  expect(missionParsed.structureName).toEqual(expectedMissionParsed.structureName);
  expect(missionParsed.address).toEqual(expectedMissionParsed.address);
  expect(missionParsed.zip).toEqual(expectedMissionParsed.zip);
  expect(missionParsed.city).toEqual(expectedMissionParsed.city);
  expect(missionParsed.department).toEqual(expectedMissionParsed.department);
  expect(missionParsed.region).toEqual(expectedMissionParsed.region);
  expect(missionParsed.country).toEqual(expectedMissionParsed.country);
  expect(missionParsed.remote).toEqual(expectedMissionParsed.remote);
  expect(missionParsed.location.lat).toEqual(expectedMissionParsed.location.lat);
  expect(missionParsed.location.lon).toEqual(expectedMissionParsed.location.lon);
}

const notExisitingMissionId = "123a49ba503040e4d2153944";

module.exports = {
  getMissionsHelper,
  getMissionByIdHelper,
  deleteMissionByIdHelper,
  createMissionHelper,
  expectMissionToEqual,
  notExisitingMissionId,
};

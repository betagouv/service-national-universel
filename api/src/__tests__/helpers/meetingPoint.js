const MeetingPointObject = require("../../models/meetingPoint");

async function getMeetingPointsHelper() {
  return await MeetingPointObject.find({});
}

async function getMeetingPointByIdHelper(id) {
  return await MeetingPointObject.findOne({ _id: id });
}

async function deleteMeetingPointByIdHelper(id) {
  const MeetingPoint = await getMeetingPointByIdHelper(id);
  await MeetingPoint.remove();
}

async function deleteAllMeetingPointsHelper() {
  await MeetingPointObject.deleteMany({});
}

async function createMeetingPointHelper(MeetingPoint) {
  return await MeetingPointObject.create(MeetingPoint);
}

const notExistingMeetingPointId = "104a49ba223040e4d2153223";

module.exports = {
  getMeetingPointsHelper,
  getMeetingPointByIdHelper,
  deleteMeetingPointByIdHelper,
  createMeetingPointHelper,
  deleteAllMeetingPointsHelper,
  notExistingMeetingPointId,
};

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

module.exports = {
  getMeetingPointsHelper,
  getMeetingPointByIdHelper,
  deleteMeetingPointByIdHelper,
  createMeetingPointHelper,
  deleteAllMeetingPointsHelper,
};

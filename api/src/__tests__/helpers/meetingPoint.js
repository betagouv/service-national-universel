const MeetingPointObject = require("../../models/meetingPoint");

async function createMeetingPointHelper(MeetingPoint) {
  return await MeetingPointObject.create(MeetingPoint);
}

const notExistingMeetingPointId = "104a49ba223040e4d2153223";

module.exports = {
  createMeetingPointHelper,
  notExistingMeetingPointId,
};

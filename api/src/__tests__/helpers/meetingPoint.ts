import { MeetingPointModel } from "../../models";

async function createMeetingPointHelper(MeetingPoint) {
  return await MeetingPointModel.create(MeetingPoint);
}

async function getMeetingPointByIdHelper(id) {
  return await MeetingPointModel.findById(id);
}

const notExistingMeetingPointId = "104a49ba223040e4d2153223";

export { createMeetingPointHelper, getMeetingPointByIdHelper, notExistingMeetingPointId };

import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { MeetingPointType } from "../../models";
const { ObjectId } = Types;

function getNewMeetingPointFixture(): Partial<MeetingPointType> {
  return {
    busId: new ObjectId().toString(),
    busExcelId: faker.lorem.words(),
    centerId: faker.lorem.words(),
    centerCode: faker.lorem.words(),
    departureAddress: faker.lorem.words(),
    departureZip: faker.lorem.words(),
    departureCity: faker.lorem.words(),
    departureDepartment: faker.lorem.words(),
    departureRegion: faker.lorem.words(),
    departureAt: faker.date.past(),
    departureAtString: faker.lorem.words(),
    returnAt: faker.date.past(),
    returnAtString: faker.lorem.words(),
    cohortId: new ObjectId().toString(),
  };
}

export default getNewMeetingPointFixture;

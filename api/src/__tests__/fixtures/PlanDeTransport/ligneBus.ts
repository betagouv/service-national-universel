import { fakerFR as faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { LigneBusType } from "../../../models";

function getNewLigneBusFixture(object: Partial<LigneBusType> = {}): Partial<LigneBusType> {
  return {
    busId: faker.lorem.words(),
    youngCapacity: faker.number.int({ min: 11, max: 20 }),
    youngSeatsTaken: faker.number.int({ min: 1, max: 10 }),
    centerDepartureTime: "10:00",
    centerArrivalTime: "16:00",
    travelTime: faker.number.int({ min: 1, max: 4 }).toString(),
    followerCapacity: faker.number.int({ min: 1, max: 10 }),
    totalCapacity: faker.number.int({ min: 31, max: 40 }),
    returnDate: faker.date.past(),
    departuredDate: faker.date.past(),
    // name: faker.lorem.words(),
    centerId: new mongoose.Types.ObjectId().toString(),
    sessionId: "session_id",
    cohort: "Février 2023 - C",
    ...object,
  };
}

export default getNewLigneBusFixture;

import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { BusType } from "../../models/bus";

function getNewBusFixture(): Partial<BusType> {
  return {
    idExcel: faker.lorem.words(),
    capacity: faker.number.int({ min: 11, max: 20 }),
    placesLeft: faker.number.int({ min: 1, max: 10 }),
    cohortId: new ObjectId().toString(),
  };
}

export default getNewBusFixture;

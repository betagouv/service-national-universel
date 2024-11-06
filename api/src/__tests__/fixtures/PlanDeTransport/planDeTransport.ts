import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { PlanTransportType } from "snu-lib";
const { ObjectId } = Types;

const getPlanDeTransportFixture = (object: Partial<PlanTransportType> = {}): Partial<PlanTransportType> => ({
  centerDepartureTime: "15:00",
  centerArrivalTime: "18:00",
  centerName: "centerName",
  centerDepartment: "centerDepartment",
  centerRegion: "centerRegion",
  centerId: new ObjectId().toHexString(),
  travelTime: "5",
  followerCapacity: 10,
  totalCapacity: 50,
  youngCapacity: 40,
  returnString: "12:00",
  departureString: "10:00",
  busId: faker.lorem.words(),
  cohort: "Février 2023 - C",
  ...object,
});

export default getPlanDeTransportFixture;

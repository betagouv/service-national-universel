import { fakerFR as faker } from "@faker-js/faker";
import { LigneToPointType } from "../../../models";

function getNewLigneToPointFixture(): Partial<LigneToPointType> {
  return {
    busArrivalHour: "16:00",
    departureHour: "11:00",
    meetingHour: "10:00",
    returnHour: "17:00",
    transportType: faker.helpers.arrayElement(["train", "bus", "fusée", "avion"]),
  };
}

export default getNewLigneToPointFixture;

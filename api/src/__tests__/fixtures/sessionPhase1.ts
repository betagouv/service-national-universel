import { Types } from "mongoose";
const { ObjectId } = Types;
import { SessionPhase1Type } from "snu-lib";

function getNewSessionPhase1Fixture(object: Partial<SessionPhase1Type> = {}): Partial<SessionPhase1Type> {
  const placesLeft = 15;
  return {
    cohort: "2021",
    department: "Yvelines",
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    status: "VALIDATED",
    cohortId: new ObjectId().toString(),
    ...object,
  };
}

export { getNewSessionPhase1Fixture };

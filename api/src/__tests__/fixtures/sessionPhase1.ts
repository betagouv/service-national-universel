import { SessionPhase1Type } from "snu-lib";

function getNewSessionPhase1Fixture(object: Partial<SessionPhase1Type> = {}): Partial<SessionPhase1Type> {
  const placesLeft = 15;
  return {
    cohort: "2021",
    department: "Yvelines",
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    status: "VALIDATED",
    cohortId: "1",
    ...object,
  };
}

export { getNewSessionPhase1Fixture };

import { BusTeamDto } from "snu-lib/src/dto";
import LigneBusModel from "@/models/PlanDeTransport/ligneBus";
// import { mapBusTeamDtoToBusTeamModel } from "@/planDeTransport/ligneDeBus/busTeam/busTeamMapper";

export const updateTeamByLigneDeBusNames = async (ligneDeBusNames: string[], busTeamDto: BusTeamDto) => {
  console.log("updateTeamByLigneDeBusNames", ligneDeBusNames, JSON.stringify(busTeamDto));
  const ligneBus = await LigneBusModel.find({ busId: { $in: ligneDeBusNames } });
  // const team = mapBusTeamDtoToBusTeamModel(busTeamDto);
  console.log("ligneBus", ligneBus);
};

import { BusTeamRole, BusTeamUpdateDto } from "snu-lib/src/dto";
import { BusTeamView } from "@/scenes/plan-transport/ligne-bus/View/components/BusTeam";

export const mapBusTeamViewToDto = (busTeam: BusTeamView): BusTeamUpdateDto => {
  return {
    role: busTeam.role as BusTeamRole,
    lastName: busTeam.lastname,
    firstName: busTeam.firstname,
    birthdate: busTeam.birthdate,
    mail: busTeam.mail,
    phone: busTeam.phone,
    forth: busTeam.forth,
    back: busTeam.back,
  };
};

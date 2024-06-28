import { BusTeamUpdateDto } from "snu-lib/src/dto";

export const mapBusTeamToUpdate = (ligneBusDto: BusTeamUpdateDto): Omit<BusTeamUpdateDto, "idTeam"> => {
  return {
    role: ligneBusDto.role,
    lastName: ligneBusDto.lastName,
    firstName: ligneBusDto.firstName,
    birthdate: ligneBusDto.birthdate,
    phone: ligneBusDto.phone,
    mail: ligneBusDto.mail,
    forth: ligneBusDto.forth,
    back: ligneBusDto.back,
  };
};

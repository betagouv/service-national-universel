import { JeuneModel } from "./Jeune.model";
import { YoungDto } from "snu-lib";

export class JeuneMapper {
    static mapJeuneModelToYoungDto(jeune: JeuneModel): YoungDto {
        return {
            id: jeune.id,
            firstName: jeune.prenom,
            lastName: jeune.nom,
            email: jeune.email,
            phone: jeune.telephone,
            //etc.....
        };
    }
}

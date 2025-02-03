import { Inject, Injectable } from "@nestjs/common";
import { SejourGateway } from "./Sejour.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

@Injectable()
export class SejourService {
    constructor(
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
    ) {}

    async updatePlacesSejour(idSejour: string) {
        const sejour = await this.sejourGateway.findById(idSejour);
        const jeunes = await this.jeuneGateway.findBySejourId(idSejour);
        const placesTaken = jeunes.filter(
            (jeune) =>
                ["AFFECTED", "DONE"].includes(jeune.statutPhase1) &&
                jeune.cohesionStayPresence !== "false" &&
                jeune.statut === "VALIDATED",
        ).length;
        const placesLeft = Math.max(0, (sejour.placesTotal || 0) - placesTaken);
        if (sejour.placesRestantes !== placesLeft) {
            sejour.placesRestantes = placesLeft;
            await this.sejourGateway.update(sejour);
        }
    }
}

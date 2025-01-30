import { Inject, Injectable } from "@nestjs/common";
import { SejourGateway } from "./Sejour.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

@Injectable()
export class SejourService {
    constructor(
        @Inject(SejourGateway)
        @Inject(JeuneGateway)
        private readonly sejourGateway: SejourGateway,
        private readonly jeuneGateway: JeuneGateway,
    ) {}

    async updatePlacesSessionPhase1(idSejour: string) {
        const sejour = await this.sejourGateway.findById(idSejour);
        const jeunes = await this.jeuneGateway.findBySessionId(idSejour);
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

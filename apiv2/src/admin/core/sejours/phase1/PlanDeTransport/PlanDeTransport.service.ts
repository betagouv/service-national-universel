import { Inject, Injectable } from "@nestjs/common";
import { PlanDeTransportGateway } from "./PlanDeTransport.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";

@Injectable()
export class PlanDeTransportService {
    constructor(
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
    ) {}

    async updateSeatsTakenInBusLine(busId: string) {
        const ligneBus = await this.ligneDeBusGateway.findById(busId);
        const jeuneDansLeBus = await this.jeuneGateway.findInBus(busId);
        const placesPrises = jeuneDansLeBus.length;
        if (ligneBus.placesOccupeesJeunes !== placesPrises) {
            ligneBus.placesOccupeesJeunes = placesPrises;
            await this.ligneDeBusGateway.update(ligneBus);

            const planTransport = await this.planDeTransportGateway.findById(busId);
            planTransport.placesOccupeesJeunes = placesPrises;
            planTransport.lineFillingRate =
                planTransport.placesOccupeesJeunes && Math.floor((placesPrises / planTransport.capaciteJeunes) * 100);
            await this.planDeTransportGateway.update(planTransport);
        }
    }
}

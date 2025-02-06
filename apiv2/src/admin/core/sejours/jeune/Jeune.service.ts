import { Inject, Injectable } from "@nestjs/common";
import { JeuneModel } from "./Jeune.model";
import { JeuneGateway } from "./Jeune.gateway";

@Injectable()
export class JeuneService {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}

    findAll(): Promise<JeuneModel[]> {
        return this.jeuneGateway.findAll();
    }
}

import { Inject, Injectable } from "@nestjs/common";
import { JeuneModel } from "./Jeune.model";
import { JeuneGateway } from "./Jeune.gateway";

@Injectable()
export class JeuneService {
    constructor(@Inject(JeuneGateway) private readonly classeGateway: JeuneGateway) {}

    findAll(): Promise<JeuneModel[]> {
        return this.classeGateway.findAll();
    }
}

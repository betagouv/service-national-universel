import { UseCase } from "@shared/core/UseCase";
import { Inject, Injectable } from "@nestjs/common";
import { ClasseModel } from "../Classe.model";
import { ClasseGateway } from "../Classe.gateway";

@Injectable()
export class FindClassePourPublic implements UseCase<ClasseModel> {
    constructor(@Inject(ClasseGateway) private readonly classeGateway: ClasseGateway) {}
    execute(id: string, withDetails: boolean): Promise<ClasseModel> {
        const classe = this.classeGateway.findById(id);
        return classe;
    }
}

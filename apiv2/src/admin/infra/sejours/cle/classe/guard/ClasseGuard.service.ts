import { Inject, Injectable } from "@nestjs/common";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";

@Injectable()
export class ClasseGuardService {
    constructor(@Inject(ClasseGateway) private readonly classeGateway: ClasseGateway) {}
    async findClasse(request: any): Promise<ClasseModel> {
        let classe = request.classe;
        if (!classe) {
            classe = await this.classeGateway.findById(request.params.id);
        }
        if (!classe) {
            throw new Error("Classe not found");
        }
        return classe;
    }
}

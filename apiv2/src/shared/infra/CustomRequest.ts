import { Request } from "express";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";

export interface CustomRequest extends Request {
    user: Partial<ReferentModel>;
    correlationId: string;
    token: string;
    classe: Partial<ClasseModel>;
    jeune: Partial<JeuneModel>;
}

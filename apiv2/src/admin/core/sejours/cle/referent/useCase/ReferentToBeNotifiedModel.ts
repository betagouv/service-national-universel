import { ReferentModel } from "@admin/core/iam/Referent.model";

export interface ReferentToBeNotifiedModel extends ReferentModel {
    nom?: string;
    prenom?: string;
    email: string;
}

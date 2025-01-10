import { ClasseImportXslx, ClasseImportModel } from "./ReferentielClasse.model";

export class ReferentielClasseMapper {
    static mapFromFile(classes: ClasseImportXslx[]): ClasseImportModel[] {
        return classes.map((classe) => ({
            classeId: classe["Identifiant de la classe engagée"],
            cohortCode: classe["Session formule"],
            classeTotalSeats: classe["Effectif de jeunes concernés"],
            centerCode: classe["Désignation du centre"],
            pdrCode: classe["Code point de rassemblement initial"],
            sessionCode: `${classe["Session : Code de la session"]}_${classe["Désignation du centre"]}`,
        }));
    }
}

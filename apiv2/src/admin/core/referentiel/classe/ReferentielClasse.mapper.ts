import {
    ClasseImportXlsx,
    ClasseImportModel,
    ClasseDesisterXlsx,
    ClasseDesisterModel,
} from "./ReferentielClasse.model";

export class ReferentielClasseMapper {
    static mapImporterClassesFromFile(classes: ClasseImportXlsx[]): ClasseImportModel[] {
        return classes.map((classe) => ({
            classeId: classe["Identifiant de la classe engagée"],
            cohortCode: classe["Session formule"],
            classeTotalSeats: classe["Effectif de jeunes concernés"],
            centerCode: classe["Désignation du centre"],
            pdrCode: classe["Code point de rassemblement initial"],
            sessionCode: `${classe["Session : Code de la session"]}_${classe["Désignation du centre"]}`,
        }));
    }

    static mapDesisterClassesFromFile(classes: ClasseDesisterXlsx[]): ClasseDesisterModel[] {
        return classes.map((classe) => {
            return { classeId: classe["Identifiant de la classe engagée"]?.toLowerCase() };
        });
    }
}

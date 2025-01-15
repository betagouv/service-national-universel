import {
    ClasseImportXslx,
    ClasseImportModel,
    ClasseDesisterXslx,
    ClasseDesisterModel,
} from "./ReferentielClasse.model";

export class ReferentielClasseMapper {
    static mapImporterClassesFromFile(classes: ClasseImportXslx[]): ClasseImportModel[] {
        return classes.map((classe) => ({
            classeId: classe["Identifiant de la classe engagée"],
            cohortCode: classe["Session formule"],
            classeTotalSeats: classe["Effectif de jeunes concernés"],
            centerCode: classe["Désignation du centre"],
            pdrCode: classe["Code point de rassemblement initial"],
            sessionCode: `${classe["Session : Code de la session"]}_${classe["Désignation du centre"]}`,
        }));
    }

    static mapDesisterClassesFromFile(classes: ClasseDesisterXslx[]): ClasseDesisterModel[] {
        return classes.map((classe) => {
            return { classeId: classe["Identifiant de la classe engagée"]?.toLowerCase() };
        });
    }
}

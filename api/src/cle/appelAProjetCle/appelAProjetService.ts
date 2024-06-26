import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { AppelAProjetReferentService } from "./appelAProjetReferentService";
import { AppelAProjetEtablissementService } from "./appelAProjetEtablissementService";
import { AppelAProjetClasseService } from "./appelAProjetClasseService";

export class AppelAProjetService {
  public sync = async (save: boolean = false) => {
    const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();

    const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];
    console.log("AppelAProjetService.sync() - uais.length: ", uais.length);
    const etablissements = await apiEducation({
      filters: [{ key: "uai", value: uais }],
      page: 0,
      size: -1,
    });

    const appelAProjetReferentService = new AppelAProjetReferentService();
    const appelAProjetEtablissementService = new AppelAProjetEtablissementService();
    const appelAProjetClasseService = new AppelAProjetClasseService();

    for (const appelAProjet of appelAProjets) {
      let referentEtablissementId = await appelAProjetReferentService.processReferentEtablissement(appelAProjet, save);
      let savedEtablissement = await appelAProjetEtablissementService.processEtablissement(appelAProjet, etablissements, referentEtablissementId, save);
      if (!savedEtablissement) {
        continue;
      }
      let referentClasseId = await appelAProjetReferentService.processReferentClasse(appelAProjet, save);
      await appelAProjetClasseService.processClasse(appelAProjet, savedEtablissement, referentClasseId, save);
    }

    return [
      { name: "etablissementsToCreate", data: appelAProjetEtablissementService.etablissementsToCreate },
      { name: "etablissementsToUpdate", data: appelAProjetEtablissementService.etablissementsToUpdate },
      { name: "etablissementsErrors", data: appelAProjetEtablissementService.etablissementsErrors },
      { name: "classesAlreadyExisting", data: appelAProjetClasseService.classesAlreadyExisting },
      { name: "classesToCreate", data: appelAProjetClasseService.classesToCreate },
      { name: "referentsToCreate", data: appelAProjetReferentService.referentsToCreate },
      { name: "referentsAlreadyExisting", data: appelAProjetReferentService.referentsAlreadyExisting },
    ];
  };
}

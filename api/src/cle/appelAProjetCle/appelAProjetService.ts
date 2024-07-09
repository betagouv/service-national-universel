import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { AppelAProjetReferentService } from "./appelAProjetReferentService";
import { AppelAProjetEtablissementService } from "./appelAProjetEtablissementService";
import { AppelAProjetClasseService } from "./appelAProjetClasseService";
import { IAppelAProjet } from "./appelAProjetType";
import { buildUniqueClasseId } from "../classe/classeService";

type IRemovedAppelAProjet = IAppelAProjet & {
  removedReason: "sameUaiDifferentEmail" | "noUaiOrEmail" | "sameClasseUniqueId" | "invalidUAI";
};
export class AppelAProjetService {
  public sync = async (save: boolean = false, appelAProjetFixes: IAppelAProjet[] = []) => {
    const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets(appelAProjetFixes);

    const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];
    console.log("AppelAProjetService.sync() - uais.length: ", uais.length);
    const etablissements = await apiEducation({
      filters: [{ key: "uai", value: uais }],
      page: 0,
      size: -1,
    });

    const {
      retained: appelAProjetsRetained,
      warning: appelAProjetsWarning,
      removed: appelAProjetsRemoved,
    } = this.filterAppelAProjetsSameUaiButDifferentEmailChefEtablissement(appelAProjets);

    const appelAProjetReferentService = new AppelAProjetReferentService();
    const appelAProjetEtablissementService = new AppelAProjetEtablissementService();
    const appelAProjetClasseService = new AppelAProjetClasseService();

    let processCounter = 0;
    for (const appelAProjet of appelAProjetsRetained) {
      console.log("AppelAProjetService.sync() - processCounter: ", processCounter++, "/", appelAProjetsRetained.length, `(${appelAProjet.etablissement?.uai})`);
      if (!appelAProjetEtablissementService.getEtablissementFromAnnuaire(appelAProjet, etablissements)) {
        appelAProjetsRemoved.push({ ...appelAProjet, removedReason: "invalidUAI" });
        console.log("AppelAProjetService.sync() - Etablissement not found: ", appelAProjet.etablissement?.uai);
      } else {
        const referentEtablissementId = await appelAProjetReferentService.processReferentEtablissement(appelAProjet, save);
        const savedEtablissement = await appelAProjetEtablissementService.processEtablissement(appelAProjet, etablissements, referentEtablissementId, save);
        const referentClasseId = await appelAProjetReferentService.processReferentClasse(appelAProjet, save);
        await appelAProjetClasseService.processClasse(appelAProjet, savedEtablissement!, referentClasseId, save);
      }
    }

    const appelAProjetsErrors = [...appelAProjetsRemoved, ...appelAProjetsWarning].map((appelAProjet) => ({
      removedReason: appelAProjet.removedReason,
      etablissementUai: appelAProjet.etablissement.uai,
      referentEtablissementEmail: appelAProjet.referentEtablissement.email,
      classeName: appelAProjet.classe.name,
      referentClasse: JSON.stringify(appelAProjet.referentClasse),
      numberDS: appelAProjet.numberDS,
    }));

    return [
      { name: "etablissements", data: appelAProjetEtablissementService.etablissements },
      {
        name: "appelAProjetsErrors",
        data: appelAProjetsErrors,
      },
      { name: "classes", data: appelAProjetClasseService.classes },
      { name: "referents", data: appelAProjetReferentService.referents },
    ];
  };

  filterAppelAProjetsSameUaiButDifferentEmailChefEtablissement(appelAProjets: IAppelAProjet[]): {
    retained: IAppelAProjet[];
    warning: IRemovedAppelAProjet[];
    removed: IRemovedAppelAProjet[];
  } {
    const appelAProjetsRetained: IAppelAProjet[] = [];
    const appelAProjetsRemoved: IRemovedAppelAProjet[] = [];
    const appelAProjetsWarning: IRemovedAppelAProjet[] = [];
    for (const appelAProjet of appelAProjets) {
      const email = appelAProjet.referentEtablissement.email;
      const uai = appelAProjet.etablissement?.uai;
      const classeUniqueId = buildUniqueClasseId(
        { uai: appelAProjet.etablissement.uai },
        {
          name: appelAProjet.classe.name || "",
          coloration: appelAProjet.classe.coloration,
          estimatedSeats: appelAProjet.classe.estimatedSeats,
        },
      );
      const foundSameUniqueId = appelAProjets.some(
        (appelAProjetSub) =>
          buildUniqueClasseId(
            { uai: appelAProjetSub.etablissement.uai },
            {
              name: appelAProjetSub.classe.name || "",
              coloration: appelAProjetSub.classe.coloration,
              estimatedSeats: appelAProjetSub.classe.estimatedSeats,
            },
          ) === classeUniqueId && appelAProjetSub.numberDS !== appelAProjet.numberDS,
      );
      if (!uai || !email) {
        appelAProjetsRemoved.push({ ...appelAProjet, removedReason: "noUaiOrEmail" });
        continue;
      }
      const hasSameUaiButDifferentEmail = appelAProjets.some(
        (appelAProjetSub) => appelAProjetSub.etablissement?.uai === uai && appelAProjetSub.referentEtablissement.email !== email,
      );
      if (hasSameUaiButDifferentEmail) {
        appelAProjetsWarning.push({ ...appelAProjet, removedReason: "sameUaiDifferentEmail" });
        appelAProjetsRetained.push(appelAProjet);
      } else if (foundSameUniqueId) {
        appelAProjetsWarning.push({ ...appelAProjet, removedReason: "sameClasseUniqueId" });
        appelAProjetsRetained.push(appelAProjet);
      } else {
        appelAProjetsRetained.push(appelAProjet);
      }
    }
    return { retained: appelAProjetsRetained, warning: appelAProjetsWarning, removed: appelAProjetsRemoved };
  }
}

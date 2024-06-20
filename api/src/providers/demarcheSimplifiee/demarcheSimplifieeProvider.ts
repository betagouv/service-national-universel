import fetch from "node-fetch";
import config from "config";

import { IAppelAprojetClasse, IAppelAProjetEtablissement, IAppelAProjetType } from "../../cle/appelAProjetCle/appelAProjetType";
import { buildDemarcheSimplifieeBody } from "./demarcheSimplifieeQueryBuilder";
import { DemarcheSimplifieeDto, DossierState } from "./demarcheSimplifieeDto";
import { CLE_COLORATION } from "snu-lib";

const DEMARCHE_SIMPLIFIEE_API = "https://www.demarches-simplifiees.fr/api/v2/graphql ";

export const getClassesAndEtablissementsFromAppelAProjets = async (): Promise<IAppelAProjetType[]> => {
  let cursor = "";
  let numberOfCalls = 0;
  let hasNextPage = true;
  let appelAProjetDemarcheSimplifieeDto: DemarcheSimplifieeDto = {} as DemarcheSimplifieeDto;
  let appelsAProjet: IAppelAProjetType[] = [];
  while (hasNextPage && numberOfCalls < 50) {
    console.time("Demarche_Simplifiee_call_" + numberOfCalls);
    console.log("Current Demarche_Simplifiee_Current_Cursor: ", cursor);
    const body = buildDemarcheSimplifieeBody(91716, cursor, DossierState.ACCEPTE);
    const demarcheSimplifieeAppelAProjetResponse: Response = await fetch(DEMARCHE_SIMPLIFIEE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: config.API_DEMARCHE_SIMPLIFIEE_TOKEN },
      body: JSON.stringify(body),
    });
    appelAProjetDemarcheSimplifieeDto = await demarcheSimplifieeAppelAProjetResponse.json();

    cursor = appelAProjetDemarcheSimplifieeDto.data.demarche.dossiers.pageInfo.endCursor;
    hasNextPage = appelAProjetDemarcheSimplifieeDto.data.demarche.dossiers.pageInfo.hasNextPage;
    appelsAProjet = [...appelsAProjet, ...mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet(appelAProjetDemarcheSimplifieeDto)];

    console.timeEnd("Demarche_Simplifiee_call_" + numberOfCalls);
    numberOfCalls++;
  }
  return appelsAProjet;
};

export const mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet = (appelAProjetDto: DemarcheSimplifieeDto): IAppelAProjetType[] => {
  return appelAProjetDto.data.demarche.dossiers.nodes.map((formulaire) => {
    const etablissement: IAppelAProjetEtablissement = {};
    const classe: IAppelAprojetClasse = { referent: {} };

    const champDescriptorValueMap = new Map(formulaire.champs.map((champ) => [champ.champDescriptorId, champ.stringValue]));

    etablissement.uai = getUaiFromString(champDescriptorValueMap.get("Q2hhbXAtMzI2MTcwMw==") || "");
    etablissement.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjQ4Mw==");

    classe.nom = champDescriptorValueMap.get("Q2hhbXAtNDA1NDIzMg==");
    classe.coloration = mapColorationFromAppelAProjetToColoration(champDescriptorValueMap.get("Q2hhbXAtNDA1NDI0Mw=="));
    classe.nombreElevesPrevus = champDescriptorValueMap.get("Q2hhbXAtNDA1NDEzNA==");
    classe.trimestre = champDescriptorValueMap.get("Q2hhbXAtNDA1NDQyMw==");

    classe.referent.nom = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNg==");
    classe.referent.prenom = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNw==");
    classe.referent.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjU4MA==");

    return {
      etablissement,
      classe,
    };
  });
};

export const splitEtablissementCommuneUai = (champ: string) => {
  return champ.split(/, (?=[^(]*\))|, /);
};

export const getUaiFromString = (value: string) => {
  var match = value.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
};

const mapColorationFromAppelAProjetToColoration = (colorationFromAppelAProjet: string | undefined): string | undefined => {
  switch (colorationFromAppelAProjet) {
    case "Environnement":
      return CLE_COLORATION.ENVIRONMENT;
    case "Défense et mémoire":
      return CLE_COLORATION.DEFENSE;
    case "Résilience et prévention des risques":
      return CLE_COLORATION.RESILIENCE;
    case "Sport et Jeux Olympiques et Paralympiques":
      return CLE_COLORATION.SPORT;
    default:
      console.log("No matching coloration for : ", colorationFromAppelAProjet);
      return undefined;
  }
};

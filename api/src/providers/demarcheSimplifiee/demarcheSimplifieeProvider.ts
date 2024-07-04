import fetch from "node-fetch";
import config from "config";

import { IAppelAProjet } from "../../cle/appelAProjetCle/appelAProjetType";
import { buildDemarcheSimplifieeBody } from "./demarcheSimplifieeQueryBuilder";
import { DemarcheSimplifieeDto, DossierState } from "./demarcheSimplifieeDto";
import { CLE_COLORATION, TYPE_CLASSE } from "snu-lib";

const DEMARCHE_SIMPLIFIEE_API = "https://www.demarches-simplifiees.fr/api/v2/graphql ";

export const getClassesAndEtablissementsFromAppelAProjets = async (): Promise<IAppelAProjet[]> => {
  let cursor = "";
  let numberOfCalls = 0;
  let hasNextPage = true;
  let appelAProjetDemarcheSimplifieeDto: DemarcheSimplifieeDto = {} as DemarcheSimplifieeDto;
  let appelsAProjet: IAppelAProjet[] = [];
  while (hasNextPage && numberOfCalls < 50) {
    console.time("Demarche_Simplifiee_call_" + numberOfCalls);
    console.log("getClassesAndEtablissementsFromAppelAProjets() - Current Demarche_Simplifiee_Current_Cursor: ", cursor);
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
  console.log("getClassesAndEtablissementsFromAppelAProjets() - appelsAProjet.length: ", appelsAProjet.length);
  return appelsAProjet;
};

export const mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet = (appelAProjetDto: DemarcheSimplifieeDto): IAppelAProjet[] => {
  return appelAProjetDto.data.demarche.dossiers.nodes.map((formulaire) => {
    const etablissement: IAppelAProjet["etablissement"] = {} as IAppelAProjet["etablissement"];
    const referentEtablissement: IAppelAProjet["referentEtablissement"] = {} as IAppelAProjet["referentEtablissement"];
    const classe: IAppelAProjet["classe"] = {} as IAppelAProjet["classe"];
    const referentClasse: IAppelAProjet["referentClasse"] = {} as IAppelAProjet["referentClasse"];

    const champDescriptorValueMap = new Map(formulaire.champs.map((champ) => [champ.champDescriptorId, champ.stringValue]));

    etablissement.uai = getUaiFromString(champDescriptorValueMap.get("Q2hhbXAtMzI2MTcwMw=="));
    etablissement.nameAndCommune = champDescriptorValueMap.get("Q2hhbXAtMzI2MTcwMw==");
    referentEtablissement.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjQ4Mw==") || "";
    referentEtablissement.lastName = champDescriptorValueMap.get("Q2hhbXAtMzI2MjQ4MA==") || "";
    referentEtablissement.firstName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTQ1MQ==") || "";

    classe.name = champDescriptorValueMap.get("Q2hhbXAtNDA1NDIzMg==");
    classe.coloration = mapColorationFromAppelAProjetToColoration(champDescriptorValueMap.get("Q2hhbXAtNDA1NDI0Mw=="));
    classe.estimatedSeats = parseInt(champDescriptorValueMap.get("Q2hhbXAtNDA1NDEzNA==") || "0");
    classe.trimester = champDescriptorValueMap.get("Q2hhbXAtNDA1NDQyMw==");
    classe.type = mapClasseTypeFromAppelAProjetToClasseType(champDescriptorValueMap.get("Q2hhbXAtNDA1NDEyNg=="));

    referentClasse.lastName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNg==") || "";
    referentClasse.firstName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNw==") || "";
    referentClasse.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjU4MA==") || "";

    return {
      etablissement,
      referentEtablissement,
      classe,
      referentClasse,
    };
  });
};

export const getUaiFromString = (value: string | undefined) => {
  if (!value) return "";
  var match = value.match(/\(([^)]+)\)/);
  if (!match) {
    console.warn("getUaiFromString() - no UAI found in string: ", value);
  }
  return match ? match[1] : "";
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
      console.warn("mapColorationFromAppelAProjetToColoration() - No matching coloration for : ", colorationFromAppelAProjet);
      return undefined;
  }
};

const mapClasseTypeFromAppelAProjetToClasseType = (classeType: string | undefined): string | undefined => {
  switch (classeType) {
    case "Un groupe d’élèves issus de plusieurs classes":
      return TYPE_CLASSE.GROUP;
    case "Des élèves inscrits dans une seule classe":
      return TYPE_CLASSE.FULL;
    default:
      console.warn("mapClasseTypeFromAppelAProjetToClasseType() - No matching classe type for : ", classeType);
      return undefined;
  }
};

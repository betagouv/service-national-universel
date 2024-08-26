import fetch from "node-fetch";
import config from "config";
import { logger } from "../../logger";

import { CLE_COLORATION, TYPE_CLASSE } from "snu-lib";

import { ClasseType } from "../../models";
import { IAppelAProjet, IAppelAProjetOptions } from "../../cle/appelAProjetCle/appelAProjetType";
import { buildDemarcheSimplifieeBody } from "./demarcheSimplifieeQueryBuilder";
import { DemarcheSimplifieeDto, DossierState } from "./demarcheSimplifieeDto";

const DEMARCHE_SIMPLIFIEE_API = "https://www.demarches-simplifiees.fr/api/v2/graphql ";

export const getClassesAndEtablissementsFromAppelAProjets = async (appelAProjetOptions: IAppelAProjetOptions): Promise<IAppelAProjet[]> => {
  let cursor = "";
  let numberOfCalls = 0;
  let hasNextPage = true;
  let appelAProjetDemarcheSimplifieeDto: DemarcheSimplifieeDto = {} as DemarcheSimplifieeDto;
  let appelsAProjet: IAppelAProjet[] = [];
  while (hasNextPage && numberOfCalls < 50) {
    console.time("Demarche_Simplifiee_call_" + numberOfCalls);
    logger.debug(`getClassesAndEtablissementsFromAppelAProjets() - Current Demarche_Simplifiee_Current_Cursor: ${cursor}`);
    const body = buildDemarcheSimplifieeBody(91716, cursor, DossierState.ACCEPTE);
    const demarcheSimplifieeAppelAProjetResponse: Response = await fetch(DEMARCHE_SIMPLIFIEE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: config.API_DEMARCHE_SIMPLIFIEE_TOKEN },
      body: JSON.stringify(body),
    });
    appelAProjetDemarcheSimplifieeDto = await demarcheSimplifieeAppelAProjetResponse.json();

    cursor = appelAProjetDemarcheSimplifieeDto.data.demarche.dossiers.pageInfo.endCursor;
    hasNextPage = appelAProjetDemarcheSimplifieeDto.data.demarche.dossiers.pageInfo.hasNextPage;
    appelsAProjet = [...appelsAProjet, ...mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet(appelAProjetDemarcheSimplifieeDto, appelAProjetOptions)];

    console.timeEnd("Demarche_Simplifiee_call_" + numberOfCalls);
    numberOfCalls++;
  }
  logger.debug(`getClassesAndEtablissementsFromAppelAProjets() - appelsAProjet.length: ${appelsAProjet.length}`);
  return appelsAProjet;
};

export const mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet = (appelAProjetDto: DemarcheSimplifieeDto, appelAProjetOptions: IAppelAProjetOptions): IAppelAProjet[] => {
  return appelAProjetDto.data.demarche.dossiers.nodes.map((formulaire) => {
    const etablissement: IAppelAProjet["etablissement"] = {} as IAppelAProjet["etablissement"];
    const referentEtablissement: IAppelAProjet["referentEtablissement"] = {} as IAppelAProjet["referentEtablissement"];
    const classe: IAppelAProjet["classe"] = {} as IAppelAProjet["classe"];
    const referentClasse: Partial<IAppelAProjet["referentClasse"]> = {};

    const champDescriptorValueMap = new Map(formulaire.champs.map((champ) => [champ.champDescriptorId, champ.stringValue]));

    if (champDescriptorValueMap.get("Q2hhbXAtNDA5MDU1MA==") === "true") {
      // Champ UAI renseigné à la main (champ séparé)
      etablissement.uai = champDescriptorValueMap.get("Q2hhbXAtNDA5MDc0NQ==")?.toUpperCase() || "";
    } else {
      // UAI auto-completer lors de la saisie du dossier
      etablissement.uai = getUaiFromString(champDescriptorValueMap.get("Q2hhbXAtMzI2MTcwMw=="));
    }
    etablissement.nameAndCommune = champDescriptorValueMap.get("Q2hhbXAtMzI2MTcwMw==");
    referentEtablissement.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjQ4Mw==") || "";
    referentEtablissement.lastName = champDescriptorValueMap.get("Q2hhbXAtMzI2MjQ4MA==") || "";
    referentEtablissement.firstName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTQ1MQ==") || "";

    classe.name = champDescriptorValueMap.get("Q2hhbXAtNDA1NDIzMg==");
    classe.coloration = mapColorationFromAppelAProjetToColoration(champDescriptorValueMap.get("Q2hhbXAtNDA1NDI0Mw=="));
    classe.estimatedSeats = parseInt(champDescriptorValueMap.get("Q2hhbXAtNDA1NDEzNA==") || "0");
    classe.trimester = champDescriptorValueMap.get("Q2hhbXAtNDA1NDQyMw==") as any;
    classe.type = mapClasseTypeFromAppelAProjetToClasseType(champDescriptorValueMap.get("Q2hhbXAtNDA1NDEyNg=="));

    referentClasse.lastName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNg==") || "";
    referentClasse.firstName = champDescriptorValueMap.get("Q2hhbXAtNDA1MTUxNw==") || "";
    referentClasse.email = champDescriptorValueMap.get("Q2hhbXAtMzI2MjU4MA==") || "";

    const appelAProjet = {
      numberDS: formulaire.number,
      etablissement,
      referentEtablissement,
      classe,
      referentClasse: referentClasse as IAppelAProjet["referentClasse"],
    };
    const fixe = appelAProjetOptions.fixes?.find(({ numberDS }) => numberDS === appelAProjet.numberDS);
    if (fixe?.etablissement?.uai) {
      logger.debug(`mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet() - UAI ${appelAProjet.etablissement.uai} ${fixe.etablissement.uai}`);
      appelAProjet.etablissement.uai = fixe.etablissement.uai;
    }
    return appelAProjet;
  });
};

export const getUaiFromString = (value: string | undefined) => {
  if (!value) return "";
  var match = value.match(/\(([^)]+)\)/);
  if (!match) {
    logger.warn("getUaiFromString() - no UAI found in string: ", value);
  }
  return match ? match[1] : "";
};

const mapColorationFromAppelAProjetToColoration = (colorationFromAppelAProjet: string | undefined): ClasseType["coloration"] => {
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
      logger.warn("mapColorationFromAppelAProjetToColoration() - No matching coloration for : ", colorationFromAppelAProjet);
      return undefined;
  }
};

const mapClasseTypeFromAppelAProjetToClasseType = (classeType: string | undefined): ClasseType["type"] => {
  switch (classeType) {
    case "Un groupe d’élèves issus de plusieurs classes":
      return TYPE_CLASSE.GROUP;
    case "Des élèves inscrits dans une seule classe":
      return TYPE_CLASSE.FULL;
    default:
      logger.warn("mapClasseTypeFromAppelAProjetToClasseType() - No matching classe type for : ", classeType);
      return undefined;
  }
};

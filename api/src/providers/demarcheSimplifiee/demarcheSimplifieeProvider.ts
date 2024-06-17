import { IAppelAProjetType } from "../../cle/appelAProjetCle/appelAProjetType";
import { buildDemarcheSimplifieeBody } from "./demarcheSimplifieeQueryBuilder";

const fetch = require("node-fetch");

const config = require("config");
const DEMARCHE_SIMPLIFIEE_API = "https://www.demarches-simplifiees.fr/api/v2/graphql ";

export const getClassesAndEtablissementsFromAppelAProjets = async (): Promise<IAppelAProjetType[]> => {
  const body = buildDemarcheSimplifieeBody(91716);

  const appelAProjetResponse: Response = await fetch(DEMARCHE_SIMPLIFIEE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: config.API_DEMARCHE_SIMPLIFIEE_TOKEN },
    body: JSON.stringify(body),
  });
  const appelAProjetDto: AppelAProjetDemarcheSimplifieeDto[] = await appelAProjetResponse.json();
  // TODO map
  //@ts-ignore
  return appelAProjetDto?.data?.demarche?.dossiers?.nodes as IAppelAProjetType[];
  // return mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet(appelAProjetDto);
};

const buildDemarcheSimplifieeRequest = () => {
  return {};
};

// TODO : replace when you get the right properties name
const mapAppelAProjetDemarcheSimplifieeDtoToAppelAProjet = (appelAProjetDtos: AppelAProjetDemarcheSimplifieeDto[]): IAppelAProjetType[] => {
  return appelAProjetDtos.map((appelAProjetDto) => {
    return {
      etablissement: {
        email: appelAProjetDto.Email,
      },
      classe: {
        coloration: appelAProjetDto["Quelle est la thématique dominante de votre projet ?"],
        referent: {
          prenom: appelAProjetDto["Prénom du référent"],
        },
      },
    } as IAppelAProjetType;
  });
};

// TODO : remove when you get the right properties name
type AppelAProjetDemarcheSimplifieeDto = {
  ID: string;
  Email: string;
  FranceConnect: boolean;
  Civilité: string;
  Nom: string;
  Prénom: string;
  "Dépôt pour un tiers": boolean;
  "Nom du mandataire": string;
  "Prénom du mandataire": string;
  Archivé: boolean;
  "État du dossier": string;
  "Dernière mise à jour le": Date;
  "Dernière mise à jour du dossier le": Date;
  "Déposé le": Date;
  "Passé en instruction le": Date;
  "Traité le": Date;
  "Motivation de la décision": string;
  Instructeurs: string[];
  "Groupe instructeur": string;
  "Région académique": string;
  "Région académique (Code)": string;
  Académie: string;
  Département: string;
  "Département (Code)": string;
  "Etablissement, Ville (UAI)": string;
  "Nom de l'établissement": string;
  "Commune de l'établissement": string;
  "Commune de l'établissement (Code INSEE)": string;
  "Commune de l'établissement (Département)": string;
  "Nature de l'établissement": string;
  "Numéro UAI de l'établissement (ex-numéro RNE)": string;
  "Adresse postale de l'établissement": string;
  Secteur: string;
  "Adresse électronique générique de l'établissement": string;
  "L’établissement est-il situé dans un quartier prioritaire de la politique de la ville (QPV) ?": boolean;
  "L’établissement a-t-il mis en place un projet de classe engagée en 2023/2024 ?": boolean;
  "Nom du chef d'établissement": string;
  "Prénom du chef d'établissement": string;
  "Nom du référent": string;
  "Prénom du référent": string;
  "Discipline d'enseignement ou statut": string;
  "Adresse électronique du référent": string;
  "Quel intitulé avez-vous donné à votre classe engagée ?": string;
  "Quelles sont les disciplines qui portent le projet ?": string[];
  "Elèves concernés": string;
  "Nombre d’élèves prévus": number;
  "Le projet concerne": string;
  "Ces élèves sont-ils concernés par les dispositifs suivants ?": string[];
  "Quelle est la thématique dominante de votre projet ?": string;
  "Présentez votre projet en quelques lignes": string;
  "Si vous le souhaitez, vous pouvez joindre un document de présentation au format pdf.": string;
  "Votre établissement bénéficie-t-il déjà d’un label ?": boolean;
  "A quelle période souhaitez-vous que votre classe réalise prioritairement le séjour de cohésion ?": string;
  "Si votre candidature au label concerne une ou plusieurs classes de l’enseignement professionnel, précisez les dates déjà fixées pour les périodes de formation en milieu professionnel (PFMP)": string;
};

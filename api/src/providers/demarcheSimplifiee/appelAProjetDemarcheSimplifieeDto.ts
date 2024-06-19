export interface AppelAProjetDemarcheSimplifieeDto {
  data: Data;
}

export interface Data {
  demarche: Demarche;
}

export interface Demarche {
  id: string;
  number: number;
  title: string;
  dossiers: Dossiers;
}

export interface Dossiers {
  pageInfo: PageInfo;
  nodes: Node[];
}

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface Node {
  __typename: string;
  id: string;
  number: number;
  archived: boolean;
  prefilled: boolean;
  state: string;
  motivation: any;
  usager: Usager;
  prenomMandataire: string;
  nomMandataire: string;
  deposeParUnTiers: boolean;
  connectionUsager: string;
  demandeur: Demandeur;
  demarche: Demarche2;
  instructeurs: any[];
  traitements: Traitement[];
  champs: Champ[];
  annotations: any[];
}

export interface Usager {
  email: string;
}

export interface Demandeur {
  __typename: string;
  civilite: string;
  nom: string;
  prenom: string;
  email?: string | null;
}

export interface Demarche2 {
  revision: Revision;
}

export interface Revision {
  id: string;
}

export interface Traitement {
  state: string;
  emailAgentTraitant: any;
  dateTraitement: string;
  motivation: any;
}

export interface Champ {
  id: string;
  champDescriptorId: string;
  label: string;
  stringValue: string;
}

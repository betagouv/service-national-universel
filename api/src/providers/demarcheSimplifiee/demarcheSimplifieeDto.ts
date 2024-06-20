export interface DemarcheSimplifieeDto {
  data: DemarcheSimplifieeData;
}

interface DemarcheSimplifieeData {
  demarche: DemarcheSimplifieeDemarche;
}

export interface DemarcheSimplifieeDemarche {
  id: string;
  number: number;
  title: string;
  dossiers: DemarcheSimplifieeDossiers;
}

interface DemarcheSimplifieeDossiers {
  pageInfo: DemarcheSimplifieePageInfo;
  nodes: DemarcheSimplifieeNode[];
}

interface DemarcheSimplifieePageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface DemarcheSimplifieeNode {
  __typename: string;
  id: string;
  number: number;
  archived: boolean;
  prefilled: boolean;
  state: string;
  motivation: any;
  usager: DemarcheSimplifieeUsager;
  prenomMandataire: string;
  nomMandataire: string;
  deposeParUnTiers: boolean;
  connectionUsager: string;
  demandeur: DemarcheSimplifieeDemandeur;
  demarche: DemarcheSimplifieeDemarche2;
  instructeurs: any[];
  traitements: DemarcheSimplifieeTraitement[];
  champs: DemarcheSimplifieeChamp[];
  annotations: any[];
}

interface DemarcheSimplifieeUsager {
  email: string;
}

interface DemarcheSimplifieeDemandeur {
  __typename: string;
  civilite: string;
  nom: string;
  prenom: string;
  email?: string | null;
}

interface DemarcheSimplifieeDemarche2 {
  revision: DemarcheSimplifieeRevision;
}

interface DemarcheSimplifieeRevision {
  id: string;
}

interface DemarcheSimplifieeTraitement {
  state: string;
  emailAgentTraitant: any;
  dateTraitement: string;
  motivation: any;
}

interface DemarcheSimplifieeChamp {
  id: string;
  champDescriptorId: string;
  label: string;
  stringValue: string;
}

export enum DossierState {
  ACCEPTE = "accepte",
}

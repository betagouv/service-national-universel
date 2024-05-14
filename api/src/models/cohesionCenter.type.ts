// TODO: Remove after mongoose upgrade

export interface ICohesionCenter {
  name: string;
  code2022: string;
  address: string;
  city: string;
  zip: string;
  department: string;
  region: string;
  addressVerified: string;
  placesTotal: number;
  pmr: "true" | "false" | "";
  cohorts: string[];
  academy: string;
  typology: "PUBLIC_ETAT" | "PUBLIC_COLLECTIVITE" | "PRIVE_ASSOCIATION" | "PRIVE_AUTRE";
  domain: "ETABLISSEMENT" | "VACANCES" | "FORMATION" | "AUTRE";
  complement: string;
  centerDesignation: string;
  placesLeft: number;
  outfitDelivered: string;
  observations: string;
  waitingList: string[];
  COR: string;
  code: string;
  country: string;
  departmentCode: string;
  sessionStatus: ("VALIDATED" | "DRAFT" | "WAITING_VALIDATION")[];
  createdAt: Date;
  updatedAt: Date;
}

import { ROLES, CLE_COLORATION_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, STATUS_CLASSE_LIST, STATUS_PHASE1_CLASSE_LIST } from "snu-lib";

export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId?: string;
  subRole?: string;
};

export type Center = {
  academy: string;
  address: string;
  addressVerified: string;
  centerDesignation: string;
  city: string;
  code: string;
  code2022: string;
  cohorts: string[];
  complement: string;
  createdAt: string;
  department: string;
  domain: string;
  name: string;
  placesTotal?: number;
  pmr: string;
  region: string;
  sessionStatus: string[];
  typology: string;
  updatedAt: string;
  waitingList: string[];
  zip: string;
  __v: number;
  _id: string;
};

export type Session = {
  _id: string;
  cohort: string;
  placesTotal: number;
  placesLeft: number;
  dateStart: string | null;
  dateEnd: string | null;
  canBeDeleted?: boolean;
  sanitaryContactEmail: string;
};

export type Classe = {
  _id: string;
  etablissementId: string;
  etablissement?: any;
  referentClasseIds: string[];
  referents?: any;
  cohort: string;
  uniqueKey: string;
  uniqueId: string;
  uniqueKeyAndId: string;
  name: string;
  coloration: (typeof CLE_COLORATION_LIST)[keyof typeof CLE_COLORATION_LIST];
  totalSeats: number;
  seatsTaken: number;
  filiere: (typeof CLE_FILIERE_LIST)[keyof typeof CLE_FILIERE_LIST];
  grade: (typeof CLE_GRADE_LIST)[keyof typeof CLE_GRADE_LIST];
  cohesionCenterId?: string;
  cohesionCenter?: any;
  sessionId?: string;
  session?: any;
  ligneId?: string;
  pointDeRassemblementId?: string;
  pointDeRassemblement?: any;
  status: (typeof STATUS_CLASSE_LIST)[keyof typeof STATUS_CLASSE_LIST];
  statusPhase1: (typeof STATUS_PHASE1_CLASSE_LIST)[keyof typeof STATUS_PHASE1_CLASSE_LIST];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
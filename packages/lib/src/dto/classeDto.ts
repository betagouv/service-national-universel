import { STATUS_PHASE1_CLASSE_LIST } from '../constants/constants';
export type ClasseDto = {
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
  coloration:string;
  totalSeats: number;
  seatsTaken: number;
  filiere:string;
  grade:string;
  cohesionCenterId?: string;
  cohesionCenter?: any;
  sessionId?: string;
  session?: any;
  ligneId?: string;
  pointDeRassemblementId?: string;
  pointDeRassemblement?: any;
  status: string;
  statusPhase1: (typeof STATUS_PHASE1_CLASSE_LIST)[keyof typeof STATUS_PHASE1_CLASSE_LIST];
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
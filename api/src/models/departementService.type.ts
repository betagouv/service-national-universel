// TODO: Remove after mongoose upgrade

interface Contact {
  cohort: string;
  contactName: string;
  contactPhone: string;
  contactMail: string;
}

interface StateRepresentative {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  role: string;
}

export interface IDepartementService {
  contacts: Contact[];
  department: string;
  region: string;
  directionName: string;
  serviceName: string;
  serviceNumber: string;
  address: string;
  complementAddress: string;
  zip: string;
  city: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactMail: string;
  representantEtat: StateRepresentative;
  createdAt: Date;
  updatedAt: Date;
}

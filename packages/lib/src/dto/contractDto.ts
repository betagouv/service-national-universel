export interface ContractDto {
  youngId?: string;
  structureId?: string;
  applicationId?: string;
  missionId?: string;
  tutorId?: string;
  isYoungAdult?: string;

  parent1Token?: string;
  projectManagerToken?: string;
  structureManagerToken?: string;
  parent2Token?: string;
  youngContractToken?: string;

  parent1Status?: "WAITING_VALIDATION" | "VALIDATED";
  projectManagerStatus?: "WAITING_VALIDATION" | "VALIDATED";
  structureManagerStatus?: "WAITING_VALIDATION" | "VALIDATED";
  parent2Status?: "WAITING_VALIDATION" | "VALIDATED";
  youngContractStatus?: "WAITING_VALIDATION" | "VALIDATED";

  parent1ValidationDate?: Date;
  projectManagerValidationDate?: Date;
  structureManagerValidationDate?: Date;
  parent2ValidationDate?: Date;
  youngContractValidationDate?: Date;

  invitationSent?: string;
  youngFirstName?: string;
  youngLastName?: string;
  youngBirthdate?: string;
  youngAddress?: string;
  youngCity?: string;
  youngDepartment?: string;
  youngEmail?: string;
  youngPhone?: string;
  parent1FirstName?: string;
  parent1LastName?: string;
  parent1Address?: string;
  parent1City?: string;
  parent1Department?: string;
  parent1Phone?: string;
  parent1Email?: string;
  parent2FirstName?: string;
  parent2LastName?: string;
  parent2Address?: string;
  parent2City?: string;
  parent2Department?: string;
  parent2Phone?: string;
  parent2Email?: string;
  missionName?: string;
  missionObjective?: string;
  missionAction?: string;
  missionStartAt?: string;
  missionEndAt?: string;
  missionAddress?: string;
  missionCity?: string;
  missionZip?: string;
  missionDuration?: string;
  missionFrequence?: string;
  date?: string;
  projectManagerFirstName?: string;
  projectManagerLastName?: string;
  projectManagerRole?: string;
  projectManagerEmail?: string;
  structureManagerFirstName?: string;
  structureManagerLastName?: string;
  structureManagerRole?: string;
  structureManagerEmail?: string;
  tutorFirstName?: string;
  tutorLastName?: string;
  tutorRole?: string;
  tutorEmail?: string;
  structureSiret?: string;
  structureName?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

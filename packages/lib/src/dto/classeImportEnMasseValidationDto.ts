export interface ImportValidationError {
  column?: string;
  line?: number;
  code: string;
  message?: string;
}

export interface ClasseImportEnMasseValidationDto {
  isValid: boolean;
  validRowsCount: number;
  errors: ImportValidationError[];
}

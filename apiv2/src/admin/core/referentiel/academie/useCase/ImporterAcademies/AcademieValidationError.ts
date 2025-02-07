export class AcademieValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AcademieValidationError';
  }
}

export class DepartementValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DepartementValidationError';
  }
}

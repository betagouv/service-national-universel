export class RegionAcademiqueValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegionAcademiqueValidationError';
  }
}

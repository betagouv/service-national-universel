export type Field = {
  label: string;
  value: number | string;
};

export type PhoneZone = {
  shortcut: string;
  name: string;
  code: string | null;
  numberLength: number | null;
  errorMessage: string | null;
  example: string;
};

export type BeneficiaryRow = {
  line: number;
  lastName: string;
  firstName: string;
  neph: string;
  birthdate?: Date;
  examCenter: string;
  sessionDate: string;
};

export type YoungMatchCandidate = {
  _id: string;
  firstName?: string;
  lastName?: string;
  birthdateAt?: Date | string;
  statusPhase2?: string;
  roadCodeRefund?: string;
};

export type UnmatchedReason =
  | "NOT_FOUND"
  | "AMBIGUOUS"
  | "PHASE2_NOT_VALIDATED"
  | "SAVE_ERROR"
  | "INVALID_BIRTHDATE"
  | "MISSING_NAME";

export type MatchDecision =
  | { status: "MATCH" | "ALREADY"; young: YoungMatchCandidate }
  | { status: UnmatchedReason; youngs: YoungMatchCandidate[] };

export type ParseIssue = BeneficiaryRow & { reason: "INVALID_BIRTHDATE" | "MISSING_NAME" };

export type ParseResult = {
  rows: BeneficiaryRow[];
  issues: ParseIssue[];
};

const HEADER_LAST_NAME = "NOM DES BENEFICIAIRES";
const HEADER_FIRST_NAME = "PRENOMS DES BENEFICIAIRES";
const HEADER_NEPH = "NEPH";
const HEADER_BIRTHDATE = "DATE DE NAISSANCE";

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function lastNamesMatch(excelLastName: string, dbLastName: string): boolean {
  const excel = normalizeName(excelLastName);
  const db = normalizeName(dbLastName);
  return Boolean(excel && db && excel === db);
}

export function firstNamesMatch(excelFirstName: string, dbFirstName: string): boolean {
  const excel = normalizeName(excelFirstName);
  const db = normalizeName(dbFirstName);
  if (!excel || !db) {
    return false;
  }
  if (excel === db) {
    return true;
  }
  const excelTokens = excel.split(" ");
  const dbTokens = db.split(" ");
  if (excelTokens[0] !== dbTokens[0]) {
    return false;
  }
  const [shorter, longer] = excelTokens.length <= dbTokens.length ? [excelTokens, dbTokens] : [dbTokens, excelTokens];
  return shorter.every((token, index) => token === longer[index]);
}

export function toYmd(date: Date, utc: boolean): string {
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const day = utc ? date.getUTCDate() : date.getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function birthdateMatches(excelBirthdate: Date, dbBirthdate: Date | string): boolean {
  const db = dbBirthdate instanceof Date ? dbBirthdate : new Date(dbBirthdate);
  if (Number.isNaN(db.getTime()) || Number.isNaN(excelBirthdate.getTime())) {
    return false;
  }
  const excelDays = new Set([toYmd(excelBirthdate, false), toYmd(excelBirthdate, true)]);
  return excelDays.has(toYmd(db, true)) || excelDays.has(toYmd(db, false));
}

export function birthdateQueryRange(excelBirthdate: Date): { $gte: Date; $lt: Date } {
  const year = excelBirthdate.getFullYear();
  const month = excelBirthdate.getMonth();
  const day = excelBirthdate.getDate();
  return {
    $gte: new Date(Date.UTC(year, month, day - 1)),
    $lt: new Date(Date.UTC(year, month, day + 2)),
  };
}

export function parseExcelDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(Math.round((value - 25569) * 86400 * 1000));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const fr = trimmed.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);
    if (fr) {
      const day = Number(fr[1]);
      const month = Number(fr[2]);
      const year = Number(fr[3]);
      const parsed = new Date(year, month - 1, day);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function cellText(value: unknown): string {
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeName(cellText(value));
}

function isBlankRow(row: unknown[], lastNameIndex: number, firstNameIndex: number, nephIndex: number, birthdateIndex: number): boolean {
  const lastName = cellText(row[lastNameIndex]);
  const firstName = cellText(row[firstNameIndex]);
  const neph = cellText(nephIndex >= 0 ? row[nephIndex] : "");
  const birthdate = row[birthdateIndex];
  const hasBirthdate = birthdate != null && cellText(birthdate) !== "";
  return !lastName && !firstName && !neph && !hasBirthdate;
}

export function parseBeneficiaryRows(sheets: unknown[][][]): ParseResult {
  const rows: BeneficiaryRow[] = [];
  const issues: ParseIssue[] = [];
  for (const sheet of sheets) {
    const headerIndex = sheet.findIndex((row) => {
      const headers = (row ?? []).map(normalizeHeader);
      return headers.some((header) => header.includes(HEADER_LAST_NAME)) && headers.some((header) => header.includes(HEADER_FIRST_NAME));
    });
    if (headerIndex < 0) {
      continue;
    }
    const header = (sheet[headerIndex] ?? []).map(normalizeHeader);
    const lastNameIndex = header.findIndex((cell) => cell.includes(HEADER_LAST_NAME));
    const firstNameIndex = header.findIndex((cell) => cell.includes(HEADER_FIRST_NAME));
    const nephIndex = header.findIndex((cell) => cell.includes(HEADER_NEPH));
    const birthdateIndex = header.findIndex((cell) => cell.includes(HEADER_BIRTHDATE));
    const centerIndex = header.findIndex((cell) => cell.includes("CENTRE D EXAMEN") || cell.includes("CENTRE"));
    const sessionIndex = header.findIndex((cell) => cell.includes("DATE DE LA SESSION"));
    if (lastNameIndex < 0 || firstNameIndex < 0 || birthdateIndex < 0) {
      continue;
    }
    for (let i = headerIndex + 1; i < sheet.length; i++) {
      const row = sheet[i] ?? [];
      if (isBlankRow(row, lastNameIndex, firstNameIndex, nephIndex, birthdateIndex)) {
        continue;
      }
      const lastName = cellText(row[lastNameIndex]);
      const firstName = cellText(row[firstNameIndex]);
      const base: BeneficiaryRow = {
        line: i + 1,
        lastName,
        firstName,
        neph: cellText(nephIndex >= 0 ? row[nephIndex] : ""),
        examCenter: cellText(centerIndex >= 0 ? row[centerIndex] : ""),
        sessionDate: cellText(sessionIndex >= 0 ? row[sessionIndex] : ""),
      };
      if (!lastName || !firstName) {
        issues.push({ ...base, reason: "MISSING_NAME" });
        continue;
      }
      const birthdate = parseExcelDate(row[birthdateIndex]);
      if (!birthdate) {
        issues.push({ ...base, reason: "INVALID_BIRTHDATE" });
        continue;
      }
      rows.push({ ...base, birthdate });
    }
  }
  return { rows, issues };
}

export function decideMatch(row: BeneficiaryRow, candidates: YoungMatchCandidate[]): MatchDecision {
  const excelBirthdate = row.birthdate;
  if (!excelBirthdate) {
    return { status: "INVALID_BIRTHDATE", youngs: [] };
  }
  const byDate = candidates.filter((young) => young.birthdateAt && birthdateMatches(excelBirthdate, young.birthdateAt));
  const matches = byDate.filter((young) => {
    if (!young.lastName || !young.firstName) {
      return false;
    }
    return lastNamesMatch(row.lastName, young.lastName) && firstNamesMatch(row.firstName, young.firstName);
  });
  if (matches.length === 0) {
    return { status: "NOT_FOUND", youngs: [] };
  }
  if (matches.length > 1) {
    return { status: "AMBIGUOUS", youngs: matches };
  }
  const young = matches[0];
  if (young.statusPhase2 !== "VALIDATED") {
    return { status: "PHASE2_NOT_VALIDATED", youngs: [young] };
  }
  if (young.roadCodeRefund === "true") {
    return { status: "ALREADY", young };
  }
  return { status: "MATCH", young };
}

export function csvEscape(value: string | number | undefined | null): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function unmatchedCsvLine(row: BeneficiaryRow, reason: UnmatchedReason, young?: YoungMatchCandidate): string {
  return [
    csvEscape(row.line),
    csvEscape(row.lastName),
    csvEscape(row.firstName),
    csvEscape(row.neph),
    csvEscape(row.birthdate ? toYmd(row.birthdate, false) : ""),
    csvEscape(row.examCenter),
    csvEscape(row.sessionDate),
    csvEscape(reason),
    csvEscape(young?._id),
    csvEscape(young?.statusPhase2),
  ].join(",");
}

export const ERRORS_CSV_HEADER = ["ligne", "nom", "prenoms", "neph", "dateNaissance", "centre", "dateSession", "raison", "youngId", "statusPhase2"].join(",");

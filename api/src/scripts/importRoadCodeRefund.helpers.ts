export type BeneficiaryRow = {
  line: number;
  lastName: string;
  firstName: string;
  birthdate?: Date;
};

export type YoungMatchCandidate = {
  _id: string;
  firstName?: string;
  lastName?: string;
  birthdateAt?: Date | string;
  statusPhase2?: string;
  roadCodeRefund?: string;
  status?: string;
  cohort?: string;
};

export type UnmatchedReason =
  | "NOT_FOUND"
  | "AMBIGUOUS"
  | "PHASE2_NOT_VALIDATED"
  | "SAVE_ERROR"
  | "LOOKUP_ERROR"
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

function isBlankRow(row: unknown[], lastNameIndex: number, firstNameIndex: number, birthdateIndex: number): boolean {
  const lastName = cellText(row[lastNameIndex]);
  const firstName = cellText(row[firstNameIndex]);
  const birthdate = row[birthdateIndex];
  const hasBirthdate = birthdate != null && cellText(birthdate) !== "";
  return !lastName && !firstName && !hasBirthdate;
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
    const birthdateIndex = header.findIndex((cell) => cell.includes(HEADER_BIRTHDATE));
    if (lastNameIndex < 0 || firstNameIndex < 0 || birthdateIndex < 0) {
      continue;
    }
    for (let i = headerIndex + 1; i < sheet.length; i++) {
      const row = sheet[i] ?? [];
      if (isBlankRow(row, lastNameIndex, firstNameIndex, birthdateIndex)) {
        continue;
      }
      const lastName = cellText(row[lastNameIndex]);
      const firstName = cellText(row[firstNameIndex]);
      const base: BeneficiaryRow = {
        line: i + 1,
        lastName,
        firstName,
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

export type CloseMatch = {
  young: YoungMatchCandidate;
  score: number;
  reasons: string[];
};

export function repairMojibake(value: string): string {
  if (!value.includes("Ã") && !value.includes("Â")) {
    return value;
  }
  const repaired = Buffer.from(value, "latin1").toString("utf8");
  return repaired.includes("\uFFFD") ? value : repaired;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      curr.push(Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost));
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[b.length];
}

export function nameTokens(value: string): string[] {
  return normalizeName(repairMojibake(value))
    .split(" ")
    .filter((token) => token.length >= 2);
}

function ymdUtcMs(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function birthdateDistanceDays(excelBirthdate: Date, dbBirthdate: Date | string): number {
  const db = dbBirthdate instanceof Date ? dbBirthdate : new Date(dbBirthdate);
  if (Number.isNaN(db.getTime()) || Number.isNaN(excelBirthdate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  const excelDays = [toYmd(excelBirthdate, false), toYmd(excelBirthdate, true)];
  const dbDays = [toYmd(db, false), toYmd(db, true)];
  let min = Number.POSITIVE_INFINITY;
  for (const excelDay of excelDays) {
    for (const dbDay of dbDays) {
      min = Math.min(min, Math.abs(ymdUtcMs(excelDay) - ymdUtcMs(dbDay)) / 86_400_000);
    }
  }
  return min;
}

export function rankCloseCandidates(row: BeneficiaryRow, candidates: YoungMatchCandidate[], limit = 5): CloseMatch[] {
  const excelLast = normalizeName(repairMojibake(row.lastName));
  const excelFirst = normalizeName(repairMojibake(row.firstName));
  const excelLastTokens = nameTokens(row.lastName);
  const ranked = candidates.flatMap((young) => {
    if (!young.lastName || !young.firstName) {
      return [];
    }
    const reasons: string[] = [];
    let score = 0;
    const dbLast = normalizeName(young.lastName);
    const dbFirst = normalizeName(young.firstName);
    const dbLastTokens = nameTokens(young.lastName);
    if (excelLast && dbLast && excelLast === dbLast) {
      reasons.push("LAST_NAME");
      score += 50;
    } else if (excelLastTokens.some((token) => dbLastTokens.includes(token))) {
      reasons.push("LAST_NAME_TOKEN");
      score += 30;
    } else {
      const lastDistance = levenshtein(excelLast, dbLast);
      if (excelLast.length >= 5 && lastDistance > 0 && lastDistance <= 2) {
        reasons.push("LAST_NAME_CLOSE");
        score += lastDistance === 1 ? 25 : 15;
      }
    }
    if (firstNamesMatch(repairMojibake(row.firstName), young.firstName)) {
      reasons.push("FIRST_NAME");
      score += 40;
    } else {
      const excelFirstToken = nameTokens(row.firstName)[0];
      const dbFirstToken = nameTokens(young.firstName)[0];
      if (excelFirstToken && excelFirstToken === dbFirstToken) {
        reasons.push("FIRST_NAME_TOKEN");
        score += 20;
      } else {
        const firstDistance = levenshtein(excelFirst, dbFirst);
        if (excelFirst.length >= 4 && firstDistance > 0 && firstDistance <= 2) {
          reasons.push("FIRST_NAME_CLOSE");
          score += firstDistance === 1 ? 20 : 12;
        }
      }
    }
    if (row.birthdate && young.birthdateAt) {
      const distance = birthdateDistanceDays(row.birthdate, young.birthdateAt);
      if (distance === 0) {
        reasons.push("BIRTHDATE");
        score += 40;
      } else if (distance <= 3) {
        reasons.push("BIRTHDATE_CLOSE");
        score += 20;
      }
    }
    const hasLast = reasons.some((reason) => reason.startsWith("LAST_NAME"));
    const hasFirst = reasons.some((reason) => reason.startsWith("FIRST_NAME"));
    const hasDate = reasons.some((reason) => reason.startsWith("BIRTHDATE"));
    const keep = (hasLast && hasFirst) || (hasLast && hasDate) || (hasFirst && hasDate && score >= 60);
    if (!keep) {
      return [];
    }
    return [{ young, score, reasons }];
  });
  return ranked.sort((a, b) => b.score - a.score || a.young._id.localeCompare(b.young._id)).slice(0, limit);
}

export function unmatchedCsvLine(row: BeneficiaryRow, reason: UnmatchedReason, youngs: YoungMatchCandidate[] = []): string {
  return [
    csvEscape(row.line),
    csvEscape(row.lastName),
    csvEscape(row.firstName),
    csvEscape(row.birthdate ? toYmd(row.birthdate, false) : ""),
    csvEscape(reason),
    csvEscape(youngs.map((young) => young._id).join(";")),
    csvEscape(youngs.map((young) => young.statusPhase2 ?? "").join(";")),
  ].join(",");
}

export const ERRORS_CSV_HEADER = ["ligne", "nom", "prenoms", "dateNaissance", "raison", "youngId", "statusPhase2"].join(",");

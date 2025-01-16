import { format } from "@fast-csv/format";
import { parse, ParserOptionsArgs } from "@fast-csv/parse";
import { Transform } from "stream";
import xlsx from "xlsx";

import { ERRORS } from "snu-lib";

import { capture } from "../sentry";
import { logger } from "../logger";

export function generateCSVStream(data: any[], headers: null | boolean | string[] = true) {
  const csvStream = format({ headers });
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
  return csvStream;
}

export function streamToBuffer(stream: Transform): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

export function XLSXToCSVBuffer(filePath: string): Buffer {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const csvData = xlsx.utils.sheet_to_csv(worksheet, { FS: "," });

  return Buffer.from(csvData, "utf-8");
}

export async function parseXLS<T>(buffer: Buffer, options?: { sheetIndex?: number; sheetName?: string; defval?: any }): Promise<T[]> {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = options?.sheetName || workbook.SheetNames[options?.sheetIndex || 0];
  const worksheet = workbook.Sheets[sheetName];

  return await xlsx.utils.sheet_to_json<T>(worksheet, { defval: options?.defval });
}

export function readCSVBuffer<T>(buffer: Buffer, options: ParserOptionsArgs = { headers: true }): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const content: T[] = [];

    const stream = parse(options)
      .on("error", (error) => {
        capture(error);
        reject(new Error(ERRORS.CANNOT_PARSE_CSV));
      })
      .on("data", (row) => {
        content.push(row);
      })
      .on("end", (rowCount: number) => {
        logger.debug(`readCSVFile() - Parsed ${rowCount} rows`);
        resolve(content);
      });
    stream.write(buffer);
    stream.end();
  });
}

export const getHeaders = <T extends object>(list: T[]): (keyof T)[] => {
  const headers = new Set<keyof T>();
  list.forEach((item) => {
    Object.keys(item).forEach((key) => headers.add(key as keyof T));
  });
  return Array.from(headers);
};

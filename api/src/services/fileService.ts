import { format } from "@fast-csv/format";
import { parse } from "@fast-csv/parse";
import { capture } from "../sentry";
import { ERRORS } from "snu-lib";
const { logger } = require("../logger");

export function generateCSVStream(data: any[], headers: null | boolean | string[] = true) {
  const csvStream = format({ headers });
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
  return csvStream;
}

export function readCSVBuffer<T>(buffer: Buffer, hasHeaders: boolean): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const content: T[] = [];

    const stream = parse({ headers: hasHeaders })
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

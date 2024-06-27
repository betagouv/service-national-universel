import { format } from "@fast-csv/format";

export function generateCSVStream(data: any[]) {
  const csvStream = format({ headers: true });
  data.forEach((row) => csvStream.write(row));
  csvStream.end();
  return csvStream;
}

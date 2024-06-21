import { format } from "@fast-csv/format";

export function generateCSVStream(data: any[]) {
  const csvStream = format({ headers: true });
  data.forEach((error) => csvStream.write(error));
  csvStream.end();
  return csvStream;
}

const XLSX = require("xlsx");

function writeAsyncToCSV(new_line, stream) {
  const tmp = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(new_line, { defval: "" }));
  if (stream.bytesWritten === 0) {
    stream.write(tmp);
  } else {
    stream.write(tmp.substring(tmp.indexOf("\n")));
  }
}

exports.writeAsyncToCSV = writeAsyncToCSV;

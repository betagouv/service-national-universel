export function withPipeStream(doc, outStream, callback) {
  doc.pipe(outStream);
  try {
    callback();
  } catch (err) {
    doc.unpipe(outStream);
    throw err;
  } finally {
    doc.end();
  }
}

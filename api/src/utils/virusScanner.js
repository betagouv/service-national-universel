const NodeClam = require("clamscan");
const { capture } = require("../sentry");
const { ERRORS } = require("./index");

async function scanFile(tempFilePath, name, user, res) {
  try {
    const clamscan = await new NodeClam().init({
      removeInfected: true,
      clamdscan: {
        host: "127.0.0.1",
        port: 3310,
        timeout: 30000,
        socket: null,
      },
    });
    const { isInfected } = await clamscan.isInfected(tempFilePath);
    if (isInfected) {
      capture(`File ${name} of user(${user._id}) is infected`);
      return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
    }
  } catch {
    return res.status(500).send({ ok: false, code: ERRORS.FILE_SCAN_DOWN });
  }
}

module.exports = scanFile;

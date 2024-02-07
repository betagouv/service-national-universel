// virusScanner.js
const NodeClam = require("clamscan");
const { capture } = require("../sentry");
const { ERRORS } = require("./index");
const { SCALEWAY_CLAMSCAN } = require("../config");

async function scanFile(tempFilePath, name, userId) {
  try {
    const clamscan = await new NodeClam().init(
      SCALEWAY_CLAMSCAN
        ? {
            removeInfected: true,
            clamdscan: {
              host: "127.0.0.1",
              port: 3310,
              timeout: 30000,
              socket: null,
            },
          }
        : {
            removeInfected: true,
          },
    );
    const { isInfected } = await clamscan.isInfected(tempFilePath);
    if (isInfected) {
      capture(`File ${name} of user(${userId}) is infected`);
      return { infected: true, error: null };
    }
    return { infected: false, error: null };
  } catch (error) {
    capture(error);
    return { infected: false, error: ERRORS.FILE_SCAN_DOWN };
  }
}

module.exports = scanFile;

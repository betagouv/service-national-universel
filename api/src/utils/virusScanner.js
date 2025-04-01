// virusScanner.js
const { config } = require("../config");
const { captureMessage } = require("../sentry");
const NodeClam = require("clamscan");

const CLAMSCAN_CONFIG = {
  removeInfected: true,
  clamdscan: {
    // timeout: 30000,
    socket: "/run/clamav/clamd.ctl",
  },
};

async function scanFile(tempFilePath, name, userId = "anonymous") {
  if (!config.ENABLE_ANTIVIRUS) {
    return { infected: false };
  }

  const clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);

  const { isInfected } = await clamscan.isInfected(tempFilePath);

  if (isInfected) {
    captureMessage(`File ${name} of user(${userId}) is infected`);
  }

  return { infected: isInfected };
}

module.exports = scanFile;

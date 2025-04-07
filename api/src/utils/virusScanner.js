const { config } = require("../config");
const { captureMessage } = require("../sentry");
const NodeClam = require("clamscan");

const CLAMSCAN_CONFIG = {
  removeInfected: true,
  clamdscan: {
    socket: "/run/clamav/clamd.ctl",
  },
};

let clamscan = null;

async function initVirusScanner() {
  if (config.ENABLE_ANTIVIRUS) {
    clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);
  }
}

async function scanFile(tempFilePath, name, userId = "anonymous") {
  if (!config.ENABLE_ANTIVIRUS) {
    return { infected: false };
  }

  const { isInfected } = await clamscan.isInfected(tempFilePath);

  if (isInfected) {
    captureMessage(`File ${name} of user(${userId}) is infected`);
  }

  return { infected: isInfected };
}

module.exports = {
  initVirusScanner,
  scanFile,
};

const { Readable } = require("stream");
const { config } = require("../config");
const { captureMessage } = require("../sentry");
const NodeClam = require("clamscan");

// Socket partagé avec api/src/utils/virusScanner.js : même ClamAV, mêmes plateformes Clever.
const CLAMSCAN_CONFIG = {
  removeInfected: false,
  clamdscan: {
    socket: "/run/clamav/clamd.ctl",
  },
};

let clamscan = null;

async function initVirusScanner() {
  if (config.ENABLE_ANTIVIRUS_SUPPORT) {
    clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);
  }
}

// Prend un Buffer plutôt qu'un chemin de fichier : les pièces jointes de snupport-api (IMAP,
// sendEmailFile) ne sont jamais écrites sur disque avant ce point.
async function scanBuffer(buffer, name, context = "unknown") {
  if (!config.ENABLE_ANTIVIRUS_SUPPORT) {
    return { infected: false };
  }

  const { isInfected } = await clamscan.scanStream(Readable.from(buffer));

  if (isInfected) {
    captureMessage(`Pièce jointe infectée : ${name} (${context})`);
  }

  return { infected: isInfected };
}

module.exports = {
  initVirusScanner,
  scanBuffer,
};

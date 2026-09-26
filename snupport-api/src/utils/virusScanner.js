const { Readable } = require("stream");
const { config } = require("../config");
const { capture } = require("../sentry");
const NodeClam = require("clamscan");

// Même client que api/src/utils/virusScanner.js (clamdscan via socket) : les pièces jointes
// support n'existent qu'en mémoire (attachments IMAP, upload multipart), scanStream leur évite
// un aller-retour disque.
const CLAMSCAN_CONFIG = {
  clamdscan: {
    socket: "/run/clamav/clamd.ctl",
  },
};

let clamscan = null;

async function initVirusScanner() {
  if (!config.ENABLE_ANTIVIRUS_SUPPORT) return;
  try {
    clamscan = await new NodeClam().init(CLAMSCAN_CONFIG);
  } catch (error) {
    capture(error);
  }
}

async function scanBuffer(buffer, name) {
  if (!config.ENABLE_ANTIVIRUS_SUPPORT) {
    return { infected: false };
  }

  if (!clamscan) {
    // Scanner activé mais non initialisé (ClamAV injoignable au démarrage) : on bloque plutôt
    // que d'accepter une pièce jointe non scannée.
    capture(new Error(`virusScanner: scanner non initialisé, pièce jointe ${name} bloquée`));
    return { infected: true };
  }

  const { isInfected } = await clamscan.scanStream(Readable.from(buffer));

  if (isInfected) {
    capture(new Error(`virusScanner: pièce jointe infectée (${name})`));
  }

  return { infected: isInfected };
}

module.exports = {
  initVirusScanner,
  scanBuffer,
};

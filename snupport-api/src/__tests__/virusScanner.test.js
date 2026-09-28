// PM49 : nouveau client ClamAV pour snupport-api, calqué sur api/src/utils/virusScanner.js mais
// scannant un buffer en mémoire (scanStream) plutôt qu'un fichier temporaire sur disque.

const buildScanner = (envOverrides = {}) => {
  jest.resetModules();
  jest.doMock("../config", () => ({ config: { ENABLE_ANTIVIRUS_SUPPORT: false, ...envOverrides } }));
  const captured = [];
  jest.doMock("../sentry", () => ({ capture: (e) => captured.push(e) }));
  return { captured };
};

afterEach(() => {
  jest.dontMock("../config");
  jest.dontMock("../sentry");
  jest.dontMock("clamscan");
});

it("scanBuffer ne scanne rien et n'est pas infecté quand le drapeau est désactivé", async () => {
  buildScanner({ ENABLE_ANTIVIRUS_SUPPORT: false });
  const NodeClamCtor = jest.fn();
  jest.doMock("clamscan", () => NodeClamCtor);
  const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");

  await initVirusScanner();
  const result = await scanBuffer(Buffer.from("contenu"), "fichier.pdf");

  expect(result).toEqual({ infected: false });
  expect(NodeClamCtor).not.toHaveBeenCalled();
});

it("scanBuffer detecte un fichier infecté quand le scanner le signale", async () => {
  buildScanner({ ENABLE_ANTIVIRUS_SUPPORT: true });
  const scanStream = jest.fn().mockResolvedValue({ isInfected: true, viruses: ["EICAR-Test"] });
  const init = jest.fn().mockResolvedValue({ scanStream });
  jest.doMock("clamscan", () => jest.fn().mockImplementation(() => ({ init })));
  const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");

  await initVirusScanner();
  const result = await scanBuffer(Buffer.from("contenu"), "virus.pdf");

  expect(result).toEqual({ infected: true });
  expect(scanStream).toHaveBeenCalledTimes(1);
});

it("scanBuffer laisse passer un fichier sain", async () => {
  buildScanner({ ENABLE_ANTIVIRUS_SUPPORT: true });
  const scanStream = jest.fn().mockResolvedValue({ isInfected: false, viruses: [] });
  const init = jest.fn().mockResolvedValue({ scanStream });
  jest.doMock("clamscan", () => jest.fn().mockImplementation(() => ({ init })));
  const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");

  await initVirusScanner();
  const result = await scanBuffer(Buffer.from("contenu"), "sain.pdf");

  expect(result).toEqual({ infected: false });
});

it("scanBuffer refuse par défaut (fail-closed) si le scanner est activé mais n'a pas pu s'initialiser", async () => {
  const { captured } = buildScanner({ ENABLE_ANTIVIRUS_SUPPORT: true });
  const init = jest.fn().mockRejectedValue(new Error("ClamAV injoignable"));
  jest.doMock("clamscan", () => jest.fn().mockImplementation(() => ({ init })));
  const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");

  await initVirusScanner();
  const result = await scanBuffer(Buffer.from("contenu"), "fichier.pdf");

  expect(result).toEqual({ infected: true });
  expect(captured.length).toBeGreaterThan(0);
});

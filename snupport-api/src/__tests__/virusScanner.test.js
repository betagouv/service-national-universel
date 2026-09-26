// PM49 (H86 residual) : les pièces jointes d'expéditeurs anonymes (entrée IMAP) sont stockées et
// servies aux agents, puis rejointes aux emails « avec historique », sans jamais être analysées.
// ENABLE_ANTIVIRUS_SUPPORT reste à false par défaut (pas d'infra ClamAV confirmée en prod) : ce
// fichier couvre donc surtout le comportement "drapeau éteint" (aucun scan, aucun crash) et,
// séparément, le comportement "drapeau allumé" avec un client clamscan entièrement mocké.

jest.mock("../config", () => ({ config: { ENABLE_ANTIVIRUS_SUPPORT: false } }));
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));

const NodeClamMock = jest.fn();
jest.mock("clamscan", () => NodeClamMock);

describe("virusScanner — drapeau désactivé (défaut de production)", () => {
  const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");

  it("n'instancie aucun client clamscan au démarrage", async () => {
    await initVirusScanner();
    expect(NodeClamMock).not.toHaveBeenCalled();
  });

  it("scanBuffer renvoie systématiquement { infected: false } sans appeler ClamAV", async () => {
    const result = await scanBuffer(Buffer.from("contenu quelconque"), "fichier.pdf", "ticket:t1");
    expect(result).toEqual({ infected: false });
    expect(NodeClamMock).not.toHaveBeenCalled();
  });
});

describe("virusScanner — drapeau activé (infra ClamAV confirmée)", () => {
  let scanStreamMock;

  beforeEach(() => {
    jest.resetModules();
    scanStreamMock = jest.fn();
    jest.doMock("../config", () => ({ config: { ENABLE_ANTIVIRUS_SUPPORT: true } }));
    jest.doMock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
    jest.doMock("clamscan", () =>
      jest.fn().mockImplementation(() => ({
        init: jest.fn().mockResolvedValue({ scanStream: scanStreamMock }),
      }))
    );
  });

  it("laisse passer un fichier sain", async () => {
    const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");
    await initVirusScanner();
    scanStreamMock.mockResolvedValue({ isInfected: false, viruses: [] });

    const result = await scanBuffer(Buffer.from("fichier propre"), "cni.pdf", "ticket:t1");

    expect(result).toEqual({ infected: false });
    expect(scanStreamMock).toHaveBeenCalledTimes(1);
  });

  it("bloque un fichier infecté et le signale à Sentry", async () => {
    const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");
    const { captureMessage } = require("../sentry");
    await initVirusScanner();
    scanStreamMock.mockResolvedValue({ isInfected: true, viruses: ["Eicar-Test-Signature"] });

    const result = await scanBuffer(Buffer.from("EICAR"), "virus.pdf", "ticket:t1");

    expect(result).toEqual({ infected: true });
    expect(captureMessage).toHaveBeenCalledWith(expect.stringContaining("virus.pdf"));
  });

  it("scanne le contenu, jamais le nom ni le type annoncés", async () => {
    const { initVirusScanner, scanBuffer } = require("../utils/virusScanner");
    await initVirusScanner();
    scanStreamMock.mockResolvedValue({ isInfected: false, viruses: [] });

    const buffer = Buffer.from("contenu binaire");
    await scanBuffer(buffer, "innocent.pdf", "ticket:t1");

    const streamArg = scanStreamMock.mock.calls[0][0];
    const chunks = [];
    for await (const chunk of streamArg) chunks.push(chunk);
    expect(Buffer.concat(chunks)).toEqual(buffer);
  });
});

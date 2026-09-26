import fs from "fs";
import os from "os";
import path from "path";

import FileType from "file-type";

import { getMimeFromBuffer, getMimeFromFile } from "../utils/file";

jest.mock("file-type");

// PM33 : un fichier ASF forgé fait boucler indéfiniment FileType.fromBuffer/fromFile (strtok3,
// file-type 16.5.4) — un timeout applicatif ne rendrait pas la main. On mocke file-type pour ces
// tests : ce qui est vérifié est que le garde-fou de snu-lib intercepte AVANT tout appel, jamais
// le comportement de la bibliothèque vulnérable elle-même.
const FORGED_ASF = Buffer.concat([Buffer.from([0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9]), Buffer.alloc(70)]);
const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n", "binary");

describe("getMimeFromBuffer", () => {
  afterEach(() => jest.clearAllMocks());

  it("écarte un buffer ASF forgé sans jamais appeler FileType.fromBuffer", async () => {
    expect(await getMimeFromBuffer(FORGED_ASF)).toBeNull();
    expect(FileType.fromBuffer).not.toHaveBeenCalled();
  });

  it("délègue à FileType.fromBuffer pour un contenu non-ASF", async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue({ mime: "application/pdf" });
    expect(await getMimeFromBuffer(PDF)).toBe("application/pdf");
    expect(FileType.fromBuffer).toHaveBeenCalledWith(PDF);
  });
});

describe("getMimeFromFile", () => {
  afterEach(() => jest.clearAllMocks());

  const writeTempFile = (buffer: Buffer): string => {
    const filePath = path.join(os.tmpdir(), `file-test-${Date.now()}-${Math.random()}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  };

  it("écarte un fichier ASF forgé sans jamais appeler FileType.fromFile", async () => {
    const filePath = writeTempFile(FORGED_ASF);
    try {
      expect(await getMimeFromFile(filePath)).toBeNull();
      expect(FileType.fromFile).not.toHaveBeenCalled();
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });

  it("délègue à FileType.fromFile pour un contenu non-ASF", async () => {
    const filePath = writeTempFile(PDF);
    try {
      (FileType.fromFile as jest.Mock).mockResolvedValue({ mime: "application/pdf" });
      expect(await getMimeFromFile(filePath)).toBe("application/pdf");
      expect(FileType.fromFile).toHaveBeenCalledWith(filePath);
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });

  it("écarte un fichier trop court sans planter", async () => {
    const filePath = writeTempFile(Buffer.from([0x01, 0x02]));
    try {
      (FileType.fromFile as jest.Mock).mockResolvedValue(undefined);
      expect(await getMimeFromFile(filePath)).toBeNull();
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });
});

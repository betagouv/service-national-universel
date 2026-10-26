import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { getMimeFromBuffer, getMimeFromFile } from "../utils/file";

const ASF_SIGNATURE = Buffer.from([0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9]);
// ASF_Header_Object dont le champ de taille est forgé : 80 octets suffisaient à figer file-type 16.5.4.
const FORGED_ASF = Buffer.concat([ASF_SIGNATURE, Buffer.alloc(70)]);
// Tag ID3v2.3 vide (10 octets) : file-type l'ignore puis relance la détection sur la suite, ce qui
// contournait la garde par signature, qui ne regarde que le début du fichier.
const EMPTY_ID3_TAG = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n", "binary");

describe("getMimeFromBuffer", () => {
  it("détecte le type d'un contenu légitime", async () => {
    expect(await getMimeFromBuffer(PDF)).toBe("application/pdf");
  });

  it("écarte un buffer ASF forgé", async () => {
    expect(await getMimeFromBuffer(FORGED_ASF)).toBeNull();
  });

  it("renvoie null pour un contenu sans signature connue", async () => {
    expect(await getMimeFromBuffer(Buffer.from("texte brut sans magic number"))).toBeNull();
  });
});

describe("getMimeFromFile", () => {
  const writeTempFile = (buffer: Buffer): string => {
    const filePath = path.join(os.tmpdir(), `file-test-${Date.now()}-${Math.random()}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  };

  it("détecte le type d'un fichier légitime", async () => {
    const filePath = writeTempFile(PDF);
    try {
      expect(await getMimeFromFile(filePath)).toBe("application/pdf");
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });

  it("écarte un fichier ASF forgé", async () => {
    const filePath = writeTempFile(FORGED_ASF);
    try {
      expect(await getMimeFromFile(filePath)).toBeNull();
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });

  it("écarte un fichier trop court sans planter", async () => {
    const filePath = writeTempFile(Buffer.from([0x01, 0x02]));
    try {
      expect(await getMimeFromFile(filePath)).toBeNull();
    } finally {
      fs.rmSync(filePath, { force: true });
    }
  });
});

// La détection d'un ASF forgé derrière un tag ID3 n'est pas interceptée par hasAsfSignature : seule
// la version de file-type l'empêche de boucler. file-type 16.5.4 y figeait le process entier, et un
// timeout jest ne rend pas la main (la boucle n'enchaîne que des promesses déjà résolues). On lance
// donc la vraie bibliothèque dans un processus enfant tué au bout de 15 s : une régression de
// version fait échouer ce test au lieu de bloquer toute la suite.
describe("file-type : ASF forgé derrière un tag ID3 (GHSA-5v7r-6r5c-r473)", () => {
  const CHILD_TIMEOUT_MS = 15_000;
  const SCRIPT = `
    import { fileTypeFromBuffer } from "file-type";
    await fileTypeFromBuffer(Buffer.from(process.argv[1], "hex"));
    process.stdout.write("TERMINE");
  `;

  const detectInChild = (buffer: Buffer) =>
    spawnSync(process.execPath, ["--input-type=module", "-e", SCRIPT, buffer.toString("hex")], {
      cwd: __dirname,
      timeout: CHILD_TIMEOUT_MS,
      encoding: "utf8",
    });

  it.each([
    ["ASF forgé", FORGED_ASF],
    ["ASF forgé derrière un tag ID3", Buffer.concat([EMPTY_ID3_TAG, FORGED_ASF])],
  ])(
    "la détection d'un %s termine",
    (_label, buffer) => {
      const result = detectInChild(buffer);
      expect({ signal: result.signal, status: result.status, stdout: result.stdout }).toEqual({ signal: null, status: 0, stdout: "TERMINE" });
    },
    30_000,
  );
});

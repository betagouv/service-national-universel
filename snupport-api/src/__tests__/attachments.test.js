// H86 (constat fusionné) : le filtre de pièces jointes de l'entrée IMAP se fiait au
// Content-Type déclaré par l'expéditeur et au nom de fichier (`filename.includes("doc")`).
// « facture.doc.exe » et « doc.html » passaient, et un SVG annoncé image/svg+xml passait
// `contentType.includes("image")` puis était resservi inline par /message/s3file/publicUrl.

const { spawnSync } = require("child_process");
const { inspectAttachment, ALLOWED_MIME_TYPES } = require("../utils/attachments");

const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n", "binary");
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGM4YWSEFTEMLQkAc/tLAZi7j8gAAAAASUVORK5CYII=", "base64");
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]);
const EXE = Buffer.concat([Buffer.from("MZ\x90\x00", "binary"), Buffer.alloc(64)]);
// PH24 : un ASF_Header_Object dont le champ de taille est forgé faisait boucler indéfiniment
// file-type 16.5.4 (strtok3). 80 octets suffisaient à figer tout snupport-api (entrée IMAP,
// réponses d'agent).
const FORGED_ASF = Buffer.concat([Buffer.from([0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9]), Buffer.alloc(70)]);
// Tag ID3v2.3 vide (10 octets) : file-type l'ignore puis relance la détection sur la suite, ce qui
// contournait la garde par signature, qui ne regarde que le début du contenu.
const EMPTY_ID3_TAG = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const HTML = Buffer.from("<html><script>alert(1)</script></html>");
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const DOCX = Buffer.from(
  "UEsDBBQAAAAIABeaRV15bjPX6AAAAK0BAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbH1QyU7DMBD9FWuuKHHggBCK0wPLETiUDxjZk8SqN3nc0v49Tlt6QIXjzFv1+tXeO7GjzDYGBbdtB4KCjsaGScHn+rV5AMEFg0EXAyk4EMNq6NeHRCyqNrCCuZT0KCXrmTxyGxOFiowxeyz1zJNMqDc4kbzrunupYygUSlMWDxj6Zxpx64p42df3qUcmxyCeTsQlSwGm5KzGUnG5C+ZXSnNOaKvyyOHZJr6pBJBXExbk74Cz7r0Ok60h8YG5vKGvLPkVs5Em6q2vyvZ/mys94zhaTRf94pZy1MRcF/euvSAebfjpL49zD99QSwMEFAAAAAgAF5pFXShR+dlcAAAAagAAAAsAAABfcmVscy8ucmVsc02Myw2AIBAFWyEU4KIHD4ZPD3awIasY+YUlxvLl6PHNTJ52b4riocZXyUbOk5LO6p0i9gE4XJXFKDIbGXqvGwD7QAl5KpXyMEdpCfuY7YSK/saTYFFqhfb/kGA/UEsDBBQAAAAIABeaRV3dWoYNDwAAAA0AAAARAAAAd29yZC9kb2N1bWVudC54bWyzKbdKyU8uzU3NK9G3AwBQSwECFAMUAAAACAAXmkVdeW4z1+gAAACtAQAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIABeaRV0oUfnZXAAAAGoAAAALAAAAAAAAAAAAAACAARkBAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIABeaRV3dWoYNDwAAAA0AAAARAAAAAAAAAAAAAACAAZ4BAAB3b3JkL2RvY3VtZW50LnhtbFBLBQYAAAAAAwADALkAAADcAQAAAAA=",
  "base64"
);
const ODT = Buffer.from(
  "UEsDBBQAAAAAAPiCNl1exjIMJwAAACcAAAAIAAAAbWltZXR5cGVhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRQSwMEFAAAAAAA+II2XSf1JFAGAAAABgAAAAsAAABjb250ZW50LnhtbDx4bWwvPlBLAQIUAxQAAAAAAPiCNl1exjIMJwAAACcAAAAIAAAAAAAAAAAAAACAAQAAAABtaW1ldHlwZVBLAQIUAxQAAAAAAPiCNl0n9SRQBgAAAAYAAAALAAAAAAAAAAAAAACAAU0AAABjb250ZW50LnhtbFBLBQYAAAAAAgACAG8AAAB8AAAAAAA=",
  "base64"
);

describe("inspectAttachment — formats légitimes", () => {
  it.each([
    ["PDF", PDF, "application/pdf"],
    ["PNG", PNG, "image/png"],
    ["JPEG", JPEG, "image/jpeg"],
    ["DOCX", DOCX, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["ODT", ODT, "application/vnd.oasis.opendocument.text"],
  ])("accepte un %s et renvoie le type détecté", async (_label, buffer, expected) => {
    const result = await inspectAttachment(buffer);
    expect(result).toEqual({ mime: expected, accepted: true });
  });
});

describe("inspectAttachment — vecteurs de H86", () => {
  it("écarte un exécutable même nommé « facture.doc.exe »", async () => {
    const result = await inspectAttachment(EXE);
    expect(result.accepted).toBe(false);
    expect(result.mime).not.toBeNull();
  });

  it("écarte un HTML même nommé « doc.html »", async () => {
    expect(await inspectAttachment(HTML)).toEqual({ mime: null, accepted: false });
  });

  it("écarte un SVG, qui était servi inline par /message/s3file/publicUrl", async () => {
    expect(await inspectAttachment(SVG)).toEqual({ mime: null, accepted: false });
  });

  it("ne se fie pas au Content-Type annoncé : inspectAttachment ne reçoit que le contenu", async () => {
    expect((await inspectAttachment(EXE)).accepted).toBe(false);
  });

  it("écarte un contenu vide ou non identifiable", async () => {
    expect(await inspectAttachment(Buffer.alloc(0))).toEqual({ mime: null, accepted: false });
    expect(await inspectAttachment(Buffer.from("texte brut sans magic number"))).toEqual({ mime: null, accepted: false });
  });
});

describe("inspectAttachment — PH24 : fichier ASF forgé", () => {
  it("écarte un fichier ASF forgé", async () => {
    expect(await inspectAttachment(FORGED_ASF)).toEqual({ mime: null, accepted: false });
  });

  it("écarte un fichier ASF forgé caché derrière un tag ID3", async () => {
    const result = await inspectAttachment(Buffer.concat([EMPTY_ID3_TAG, FORGED_ASF]));
    expect(result.accepted).toBe(false);
  });
});

// La garde par signature (hasAsfSignature) n'écarte que la forme directe : derrière un tag ID3, seule
// la version de file-type empêche la détection de boucler. file-type 16.5.4 y figeait le process
// entier, et un timeout jest ne rend pas la main (la boucle n'enchaîne que des promesses déjà
// résolues). On lance donc la vraie bibliothèque dans un processus enfant tué au bout de 15 s : une
// régression de version fait échouer ce test au lieu de bloquer toute la suite.
describe("file-type : ASF forgé derrière un tag ID3 (GHSA-5v7r-6r5c-r473)", () => {
  const SCRIPT = `
    import { fileTypeFromBuffer } from "file-type";
    await fileTypeFromBuffer(Buffer.from(process.argv[1], "hex"));
    process.stdout.write("TERMINE");
  `;

  const detectInChild = (buffer) =>
    spawnSync(process.execPath, ["--input-type=module", "-e", SCRIPT, buffer.toString("hex")], {
      cwd: __dirname,
      timeout: 15_000,
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
    30_000
  );
});

describe("ALLOWED_MIME_TYPES", () => {
  it("ne contient aucun format exécutable ni rendu par le navigateur", () => {
    for (const forbidden of ["text/html", "image/svg+xml", "application/x-msdownload", "application/x-cfb", "application/zip"]) {
      expect(ALLOWED_MIME_TYPES).not.toContain(forbidden);
    }
  });
});

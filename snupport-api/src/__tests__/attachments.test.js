// H86 (constat fusionné) : le filtre de pièces jointes de l'entrée IMAP se fiait au
// Content-Type déclaré par l'expéditeur et au nom de fichier (`filename.includes("doc")`).
// « facture.doc.exe » et « doc.html » passaient, et un SVG annoncé image/svg+xml passait
// `contentType.includes("image")` puis était resservi inline par /message/s3file/publicUrl.

const { inspectAttachment, ALLOWED_MIME_TYPES } = require("../utils/attachments");

const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n", "binary");
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]);
const EXE = Buffer.concat([Buffer.from("MZ\x90\x00", "binary"), Buffer.alloc(64)]);
const HTML = Buffer.from("<html><script>alert(1)</script></html>");
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const DOCX = Buffer.from(
  "UEsDBBQAAAAAAPiCNl0WTGNH6AAAAOgAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbDw/eG1sIHZlcnNpb249IjEuMCI/PjxUeXBlcyB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3BhY2thZ2UvMjAwNi9jb250ZW50LXR5cGVzIj48T3ZlcnJpZGUgUGFydE5hbWU9Ii93b3JkL2RvY3VtZW50LnhtbCIgQ29udGVudFR5cGU9ImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50Ii8+PC9UeXBlcz5QSwMEFAAAAAAA+II2XSf1JFAGAAAABgAAABEAAAB3b3JkL2RvY3VtZW50LnhtbDx4bWwvPlBLAQIUAxQAAAAAAPiCNl0WTGNH6AAAAOgAAAATAAAAAAAAAAAAAACAAQAAAABbQ29udGVudF9UeXBlc10ueG1sUEsBAhQDFAAAAAAA+II2XSf1JFAGAAAABgAAABEAAAAAAAAAAAAAAIABGQEAAHdvcmQvZG9jdW1lbnQueG1sUEsFBgAAAAACAAIAgAAAAE4BAAAAAA==",
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

describe("ALLOWED_MIME_TYPES", () => {
  it("ne contient aucun format exécutable ni rendu par le navigateur", () => {
    for (const forbidden of ["text/html", "image/svg+xml", "application/x-msdownload", "application/x-cfb", "application/zip"]) {
      expect(ALLOWED_MIME_TYPES).not.toContain(forbidden);
    }
  });
});

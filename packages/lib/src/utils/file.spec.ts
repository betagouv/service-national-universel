import { detectMimeTypeFromBytes, getSafeDownloadFileName, toSheetCellValue } from "./file";

describe("getSafeDownloadFileName", () => {
  it("impose l'extension du type détecté au nom du déposant", () => {
    expect(getSafeDownloadFileName("piece.hta", "application/pdf")).toBe("piece.pdf");
    expect(getSafeDownloadFileName("piece.html", "image/png")).toBe("piece.png");
    expect(getSafeDownloadFileName("carte.PDF.exe", "application/pdf")).toBe("carte_PDF.pdf");
  });

  it("garde une variante d'extension cohérente avec le type", () => {
    expect(getSafeDownloadFileName("photo.jpeg", "image/jpeg")).toBe("photo.jpeg");
    expect(getSafeDownloadFileName("photo.JPG", "image/jpeg; charset=binary")).toBe("photo.jpg");
  });

  it("retombe sur .bin pour un contenu non reconnu", () => {
    expect(getSafeDownloadFileName("piece.hta", "application/octet-stream")).toBe("piece.bin");
    expect(getSafeDownloadFileName("piece.hta", "image/*")).toBe("piece.bin");
    expect(getSafeDownloadFileName("piece.svg", undefined)).toBe("piece.bin");
  });

  it("conserve une extension sûre quand le type est inconnu", () => {
    expect(getSafeDownloadFileName("certificates.pdf", "")).toBe("certificates.pdf");
    expect(getSafeDownloadFileName("export.xlsx", undefined)).toBe("export.xlsx");
  });

  it("retire chemins, caractères de contrôle et caractères interdits", () => {
    expect(getSafeDownloadFileName("../../etc/passwd.pdf", "application/pdf")).toBe("passwd.pdf");
    expect(getSafeDownloadFileName("C:\\Users\\a\\b<c>.pdf", "application/pdf")).toBe("b_c.pdf");
    expect(getSafeDownloadFileName("a\u0000b\nc.pdf", "application/pdf")).toBe("abc.pdf");
  });

  it("fournit un nom par défaut quand la base est vide", () => {
    expect(getSafeDownloadFileName(".hta", "application/pdf")).toBe("hta.pdf");
    expect(getSafeDownloadFileName("", "application/pdf")).toBe("document.pdf");
    expect(getSafeDownloadFileName(undefined, "image/png", "cni")).toBe("cni.png");
  });

  it("reste linéaire sur une longue suite de séparateurs (pas de ReDoS)", () => {
    const start = Date.now();
    expect(getSafeDownloadFileName(`a${"\t".repeat(100000)}b.pdf`, "application/pdf")).toBe("ab.pdf");
    expect(getSafeDownloadFileName(`${"_".repeat(100000)}x`, "application/pdf")).toBe("x.pdf");
    expect(getSafeDownloadFileName(`x${"_ ".repeat(50000)}!y.pdf`, "application/pdf")).toMatch(/^x_ [_ ]*\.pdf$/);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it("borne la longueur de la base", () => {
    const name = getSafeDownloadFileName(`${"a".repeat(500)}.pdf`, "application/pdf");
    expect(name).toBe(`${"a".repeat(150)}.pdf`);
  });
});

describe("detectMimeTypeFromBytes", () => {
  const bytes = (text: string) => Array.from(Buffer.from(text, "latin1"));

  it("reconnaît les signatures usuelles", () => {
    expect(detectMimeTypeFromBytes(bytes("%PDF-1.7\n"))).toBe("application/pdf");
    expect(detectMimeTypeFromBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])).toBe("image/png");
    expect(detectMimeTypeFromBytes([0xff, 0xd8, 0xff, 0xe0])).toBe("image/jpeg");
    expect(detectMimeTypeFromBytes(bytes("GIF89a"))).toBe("image/gif");
    expect(detectMimeTypeFromBytes(bytes("RIFF\u0000\u0000\u0000\u0000WEBPVP8 "))).toBe("image/webp");
  });

  it("ne reconnaît pas du HTML ni un contenu trop court", () => {
    expect(detectMimeTypeFromBytes(bytes("<html><script>"))).toBeUndefined();
    expect(detectMimeTypeFromBytes(bytes("%PD"))).toBeUndefined();
    expect(detectMimeTypeFromBytes(undefined)).toBeUndefined();
  });
});

describe("toSheetCellValue", () => {
  it("aplatit un tableau (sinon SheetJS lit [valeur, formule])", () => {
    expect(toSheetCellValue(["Paris", 'HYPERLINK("https://example.org","x")'])).toBe('Paris, HYPERLINK("https://example.org","x")');
    expect(toSheetCellValue([{ a: 1 }, null])).toBe('{"a":1}, ');
  });

  it("sérialise un objet (sinon SheetJS le recopie comme cellule)", () => {
    expect(toSheetCellValue({ t: "s", f: "1+1" })).toBe('{"t":"s","f":"1+1"}');
  });

  it("laisse passer les scalaires et les dates", () => {
    const date = new Date("2026-09-24T00:00:00Z");
    expect(toSheetCellValue("=1+1")).toBe("=1+1");
    expect(toSheetCellValue(3)).toBe(3);
    expect(toSheetCellValue(false)).toBe(false);
    expect(toSheetCellValue(date)).toBe(date);
    expect(toSheetCellValue(null)).toBeNull();
    expect(toSheetCellValue(undefined)).toBeUndefined();
  });
});

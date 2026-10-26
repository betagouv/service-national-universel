const { getAttachmentFileName } = require("../utils/file");

describe("getAttachmentFileName (nom affiché d'une pièce jointe)", () => {
  it("impose l'extension du type détecté au nom de l'expéditeur", () => {
    expect(getAttachmentFileName("piece.hta", "application/pdf")).toBe("piece.pdf");
    expect(getAttachmentFileName("facture.doc.exe", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("facture_doc.docx");
    expect(getAttachmentFileName("photo.html", "image/png")).toBe("photo.png");
  });

  it("retombe sur .bin pour un type inconnu", () => {
    expect(getAttachmentFileName("piece.hta", null)).toBe("piece.bin");
  });

  it("retire chemins et caractères de contrôle, et nomme une base vide", () => {
    expect(getAttachmentFileName("../../x/y.pdf", "application/pdf")).toBe("y.pdf");
    expect(getAttachmentFileName("a\r\nb.pdf", "application/pdf")).toBe("ab.pdf");
    expect(getAttachmentFileName(undefined, "image/jpeg")).toBe("piece-jointe.jpg");
  });
});

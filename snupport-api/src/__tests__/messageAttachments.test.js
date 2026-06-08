const { filePathsOf } = require("../utils/messageAttachments");

describe("filePathsOf (chemins S3 à purger avant suppression d'un message)", () => {
  it("collecte les chemins des attachments ET des files", () => {
    const message = {
      attachments: [{ name: "cni.pdf", path: "message/aaa.pdf" }, { name: "sansPath" }],
      files: [{ name: "justif.pdf", path: "message/bbb.pdf" }],
    };
    expect(filePathsOf(message)).toEqual(["message/aaa.pdf", "message/bbb.pdf"]);
  });

  it("renvoie [] quand il n'y a aucune pièce jointe", () => {
    expect(filePathsOf({})).toEqual([]);
    expect(filePathsOf({ attachments: [], files: [] })).toEqual([]);
  });
});

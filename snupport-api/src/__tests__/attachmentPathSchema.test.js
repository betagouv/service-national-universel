const { SCHEMA_ATTACHMENT_PATH } = require("../schemas");

describe("SCHEMA_ATTACHMENT_PATH (chemin S3 d'une pièce jointe de message)", () => {
  const accepts = (path) => SCHEMA_ATTACHMENT_PATH.validate(path).error === undefined;

  it("accepte un objet déposé par l'upload support", () => {
    expect(accepts("message/11111111-1111-1111-1111-111111111111.pdf")).toBe(true);
  });

  it("refuse un objet hors du préfixe message/", () => {
    expect(accepts("temp/11111111-1111-1111-1111-111111111111.pdf")).toBe(false);
    expect(accepts("young/cniFiles/secret.pdf")).toBe(false);
  });

  it("refuse une traversée de préfixe", () => {
    expect(accepts("message/../young/cniFiles/secret.pdf")).toBe(false);
  });

  it("refuse un sous-dossier sous message/", () => {
    expect(accepts("message/autre/secret.pdf")).toBe(false);
  });
});

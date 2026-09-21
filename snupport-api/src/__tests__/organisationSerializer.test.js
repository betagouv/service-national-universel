const { serializeOrganisation } = require("../utils/organisation");

describe("serializeOrganisation", () => {
  const organisation = {
    _id: "6ab19d5ed8e8941f0c1baa23",
    name: "SNU",
    attributes: [{ name: "Cohorte", format: "string" }],
    spamEmails: ["spam@example.com"],
    knowledgeBaseBaseUrl: "https://base-de-connaissance.snu.gouv.fr",
    knowledgeBaseRoles: ["public"],
    apikey: "APIKEY-SUPPORT-TRES-SECRETE",
    imapConfig: [{ user: "support@snu.gouv.fr", password: "MotDePasseBoiteMail", host: "imap.snu.gouv.fr" }],
    createdAt: new Date("2024-01-01"),
  };

  it("ne renvoie jamais l'apikey de l'organisation", () => {
    expect(serializeOrganisation(organisation)).not.toHaveProperty("apikey");
  });

  it("ne renvoie jamais la configuration IMAP de la boîte mail support", () => {
    expect(serializeOrganisation(organisation)).not.toHaveProperty("imapConfig");
  });

  it("conserve les champs dont le front a besoin", () => {
    expect(serializeOrganisation(organisation)).toEqual({
      _id: organisation._id,
      name: organisation.name,
      attributes: organisation.attributes,
      spamEmails: organisation.spamEmails,
      knowledgeBaseBaseUrl: organisation.knowledgeBaseBaseUrl,
      knowledgeBaseRoles: organisation.knowledgeBaseRoles,
    });
  });

  it("liste blanche : un nouveau champ du modèle ne fuite pas par défaut", () => {
    const result = serializeOrganisation({ ...organisation, nouveauSecret: "fuite" });
    expect(result).not.toHaveProperty("nouveauSecret");
  });

  it("applique la liste blanche sur un document mongoose (via toObject)", () => {
    const document = { toObject: () => organisation };
    const result = serializeOrganisation(document);
    expect(result).not.toHaveProperty("apikey");
    expect(result.name).toBe("SNU");
  });

  it("laisse passer une organisation absente sans lever d'erreur", () => {
    expect(serializeOrganisation(null)).toBeNull();
    expect(serializeOrganisation(undefined)).toBeUndefined();
  });

  it("omet les champs non renseignés plutôt que de les mettre à undefined", () => {
    expect(serializeOrganisation({ _id: "abc", name: "SNU" })).toEqual({ _id: "abc", name: "SNU" });
  });
});

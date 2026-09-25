/**
 * Allow-list des URL insérées dans les emails transactionnels (constat M74).
 *
 * Le cas critique est le lien de la fiche sanitaire : `MedicalFileModal` (app) envoie une URL du
 * stockage objet Clever Cloud. Si l'allow-list ne la couvrait pas, le correctif casserait un
 * parcours existant.
 */
import { config } from "../config";
import { isTrustedEmailLink, sanitizeEmailText } from "../email/emailInput";

describe("isTrustedEmailLink", () => {
  it("accepte le document servi depuis le stockage objet du service", () => {
    expect(
      isTrustedEmailLink(
        "https://cellar-c2.services.clever-cloud.com/cni-bucket-prod/file/fiche-sanitaire-2024.pdf?utm_campaign=transactionnel+telecharger+docum&utm_medium=mail+410+telecharger",
      ),
    ).toBe(true);
  });

  it("accepte les deux fronts du service", () => {
    expect(isTrustedEmailLink(`${config.APP_URL}/phase1`)).toBe(true);
    expect(isTrustedEmailLink(`${config.ADMIN_URL}/volontaire`)).toBe(true);
  });

  it("refuse un domaine tiers, même ressemblant", () => {
    expect(isTrustedEmailLink("https://snu-gouv.example.org/phishing")).toBe(false);
    expect(isTrustedEmailLink("https://cellar-c2.services.clever-cloud.com.example.org/file.pdf")).toBe(false);
  });

  it("refuse une URL qui n'est pas http(s)", () => {
    expect(isTrustedEmailLink("javascript:alert(1)")).toBe(false);
    expect(isTrustedEmailLink("//example.org/phishing")).toBe(false);
  });

  it("laisse passer une valeur absente : le serveur applique son lien par défaut", () => {
    expect(isTrustedEmailLink(undefined)).toBe(true);
    expect(isTrustedEmailLink("")).toBe(true);
  });
});

describe("sanitizeEmailText", () => {
  it("retire le balisage d'un texte libre", () => {
    expect(sanitizeEmailText('Voir <a href="https://snu-gouv.example.org">ici</a>')).toEqual("Voir ici");
  });

  it("ne transforme pas une valeur absente en chaîne vide", () => {
    expect(sanitizeEmailText(undefined)).toBeUndefined();
    expect(sanitizeEmailText(null)).toBeNull();
  });
});

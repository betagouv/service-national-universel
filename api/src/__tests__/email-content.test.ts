import { SENDINBLUE_TEMPLATES } from "snu-lib";
import { REDACTED, serializeEmailContent } from "../email/emailContent";

describe("serializeEmailContent — assainissement du corps (GOO-14, FM9)", () => {
  const body = `<html><body><table style="color:red" onclick="x()"><tr><td>Bonjour <script>alert(1)</script><img src=x onerror=alert(1)>
    <a href="javascript:alert(1)">piège</a>
    <a href="https://moncompte.snu.gouv.fr/?token=abc" target="_top">lien</a></td></tr></table>
    <iframe src="https://evil.example"></iframe><form action="https://evil.example"><input name="p"></form></body></html>`;

  it("retire scripts, gestionnaires d'événements, cadres et formulaires, en gardant la mise en page", () => {
    const { body: out } = serializeEmailContent({ body }, "999999");
    expect(out).toContain(`<table style="color:red">`);
    expect(out).not.toMatch(/<script|onclick|onerror|<iframe|<form|<input|javascript:/i);
  });

  it("impose target et rel sur les liens et masque toujours les secrets", () => {
    const { body: out } = serializeEmailContent({ body }, "999999");
    expect(out).toContain(`<a href="https://moncompte.snu.gouv.fr/?token=${REDACTED}" target="_blank" rel="noopener noreferrer">lien</a>`);
  });

  it("ne restitue toujours rien pour un mail d'authentification", () => {
    const out = serializeEmailContent({ body }, String(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD));
    expect(out.body).toBeNull();
    expect(out.contentRedacted).toBe(true);
  });
});

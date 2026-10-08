import { simpleParser } from "mailparser";

// Non-régression GOO-177 (nodemailer ^9.1.1 -> ^10.0.9) : mailparser délègue l'analyse des
// en-têtes d'adresse à nodemailer/lib/addressparser (voir CHANGELOG nodemailer 10.0.5/10.0.6,
// alertes Dependabot 912-926). Les suites imap*.test.js mockent toutes "mailparser"
// (jest.mock), donc aucune n'exerce réellement simpleParser/addressparser : celui-ci est le
// seul test qui le fait, avec la vraie bibliothèque installée.
const RAW_EMAIL = [
  'From: "Jean Dupont" <jean.dupont@example.org>',
  "To: contact@snu.gouv.fr",
  "Cc: Marie Martin <marie.martin@example.org>",
  "Subject: Demande de renseignement",
  "Content-Type: text/plain; charset=utf-8",
  "",
  "Bonjour, ceci est un message de test.",
  "",
].join("\r\n");

it("simpleParser (vraie bibliothèque mailparser/nodemailer) analyse correctement les adresses d'un email normal", async () => {
  const parsed = await simpleParser(RAW_EMAIL, { skipTextToHtml: true });

  expect(parsed.from?.value).toEqual([{ address: "jean.dupont@example.org", name: "Jean Dupont" }]);
  expect(parsed.to && "value" in parsed.to ? parsed.to.value : []).toEqual([{ address: "contact@snu.gouv.fr", name: "" }]);
  expect(parsed.cc && "value" in parsed.cc ? parsed.cc.value : []).toEqual([{ address: "marie.martin@example.org", name: "Marie Martin" }]);
  expect(parsed.subject).toBe("Demande de renseignement");
});

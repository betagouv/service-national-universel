import net from "net";

jest.mock("../config", () => ({
  config: { SMTP_HOST: "127.0.0.1", SMTP_PORT: 0 },
}));

import { sendMailCatcher } from "../mailcatcher";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require("../config");

// Non-régression GOO-177 (nodemailer ^9.1.1 -> ^10.0.9) : seul test qui exerce le vrai
// transport SMTP de nodemailer (api/src/mailcatcher.ts, chemin MAIL_TRANSPORT=SMTP). Les
// autres suites email-*.test.ts mockent "../mailcatcher" ou passent par MAIL_TRANSPORT=BREVO,
// donc n'appellent jamais nodemailer.createTransport/sendMail pour de vrai.
describe("sendMailCatcher (transport SMTP réel de nodemailer)", () => {
  let server: net.Server;
  let receivedData = "";

  beforeEach(() => {
    receivedData = "";
    let buffer = "";
    let inData = false;
    server = net.createServer((socket) => {
      socket.write("220 localhost ESMTP\r\n");
      socket.on("data", (chunk) => {
        buffer += chunk.toString();
        if (inData) {
          if (buffer.endsWith("\r\n.\r\n")) {
            receivedData += buffer.slice(0, -5);
            inData = false;
            buffer = "";
            socket.write("250 OK: message accepted\r\n");
          }
          return;
        }
        const lines = buffer.split("\r\n").filter(Boolean);
        buffer = "";
        for (const line of lines) {
          if (/^EHLO/i.test(line)) {
            socket.write("250-localhost\r\n250 OK\r\n");
          } else if (/^MAIL FROM/i.test(line)) {
            socket.write("250 OK\r\n");
          } else if (/^RCPT TO/i.test(line)) {
            socket.write("250 OK\r\n");
          } else if (/^DATA/i.test(line)) {
            inData = true;
            socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
          } else if (/^QUIT/i.test(line)) {
            socket.write("221 Bye\r\n");
            socket.end();
          }
        }
      });
    });
    return new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const { port } = server.address() as net.AddressInfo;
        config.SMTP_PORT = port;
        resolve();
      });
    });
  });

  afterEach(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("envoie un email sans erreur ; le serveur SMTP reçoit le sujet et le destinataire attendus", async () => {
    await sendMailCatcher("Sujet de test GOO-177", "<p>corps du message</p>", {
      emailTo: [{ email: "destinataire@example.org" }],
    });

    expect(receivedData).toContain("Sujet de test GOO-177");
    expect(receivedData).toContain("destinataire@example.org");
  });
});

const { exec } = require("child_process");
const slack = require("../slack");
const { capture, SentryError } = require("../sentry");
const { logger } = require("../logger");

const origin = "domain.par.clever-cloud.com";
const domains = ["admin.snu.gouv.fr", "api.snu.gouv.fr", "moncompte.snu.gouv.fr"];

const alertDays = 31;

async function checkCert(domain) {
  const command = `echo | openssl s_client -connect ${origin}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -dates`;

  console.log("🚀 ~ file: monitorCertificats.js:14 ~ checkCert ~ command:", command);
  exec(command, async (error, stdout, stderr) => {
    if (error) throw new SentryError("Impossible de récupérer le certificat", { domain, error });

    const match = stdout.match(/notAfter=(.*)/);
    if (!match) throw new SentryError("Impossible de récupérer le certificat", { domain, match });

    const expiryDate = new Date(match[1]);
    const currentDate = new Date();
    const diffTime = expiryDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    await slack.alert({
      title: `Certificat Monitor`,
      text: `Le certificat pour ${domain} (CleverCloud) expire dans ${diffDays} jours (${expiryDate.toUTCString()}).`,
    });

    if (diffDays <= alertDays) {
      logger.warn(`Alerte : le certificat pour ${domain} (CleverCloud) expire dans ${diffDays} jours!`);
      await slack.alert({
        title: `Alerte Certificat SSL pour ${domain}`,
        text: `Le certificat pour ${domain} expire dans ${diffDays} jours (${expiryDate.toUTCString()}).`,
      });
    }
  });
}

exports.handler = async () => {
  try {
    for (const domain of domains) {
      await checkCert(domain);
    }
  } catch (e) {
    capture(e);
    await slack.error({
      title: "Erreur lors de la vérification des certificats",
      text: `Erreur: ${e.message}`,
    });
  }
};

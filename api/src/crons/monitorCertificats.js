// Commande pour verifier depuis le terminal (remplacer admin par api ou moncompte pour tester les autres domaines) :
// echo | openssl s_client -connect domain.par.clever-cloud.com:443 -servername admin.snu.gouv.fr 2>/dev/null | openssl x509 -noout -dates
const https = require("https");
const slack = require("../slack");
const { capture } = require("../sentry");

const origin = "domain.par.clever-cloud.com";
const domains = ["admin.snu.gouv.fr", "api.snu.gouv.fr", "moncompte.snu.gouv.fr"];
const alertDays = 31;

function checkCert(domain) {
  return new Promise((resolve, reject) => {
    const options = {
      host: origin,
      servername: domain,
      port: 443,
      method: "GET",
    };

    const req = https.request(options, (res) => {
      const certificate = res.socket.getPeerCertificate();

      if (!certificate || Object.keys(certificate).length === 0) {
        reject(new Error(`Pas de certificat reçu pour ${domain}`));
      } else {
        const expiryDate = new Date(certificate.valid_to);
        const currentDate = new Date();
        const diffTime = expiryDate - currentDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        resolve({ domain, expiryDate, diffDays });
      }
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}

exports.handler = async () => {
  try {
    for (const domain of domains) {
      try {
        const { expiryDate, diffDays } = await checkCert(domain);

        await slack.alert({
          title: `Certificat Monitor`,
          text: `Le certificat pour ${domain} (CleverCloud) expire dans ${diffDays} jours (${expiryDate.toUTCString()}).`,
        });

        if (diffDays <= alertDays) {
          console.log(`Alerte : le certificat pour ${domain} (CleverCloud) expire dans ${diffDays} jours!`);
          await slack.alert({
            title: `Alerte Certificat SSL pour ${domain}`,
            text: `Le certificat pour ${domain} expire dans ${diffDays} jours (${expiryDate.toUTCString()}).`,
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification du certificat pour ${domain}: ${error.message}`);
        await slack.error({
          title: `Erreur de vérification du certificat pour ${domain}`,
          text: `Erreur: ${error.message}`,
        });
        capture(error);
      }
    }
  } catch (e) {
    capture(e);
    console.error("Erreur lors de la vérification des certificats:", e);
    await slack.error({
      title: "Erreur lors de la vérification des certificats",
      text: `Erreur: ${e.message}`,
    });
  }
};

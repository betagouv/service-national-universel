const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { capture } = require("../sentry");
const ContractObject = require("../models/contract");
const { ERRORS } = require("../utils");
const { sendEmail } = require("../sendinblue");

router.post("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const contract = req.body;
    // Create the tokens
    contract.parent1Token = crypto.randomBytes(20).toString("hex");
    contract.projectManagerToken = crypto.randomBytes(20).toString("hex");
    contract.structureManagerToken = crypto.randomBytes(20).toString("hex");
    if (contract.parent2Email) contract.parent2Token = crypto.randomBytes(20).toString("hex");

    const data = await ContractObject.create(contract);
    if (contract.sendMessage) {
      // We send 4 messages if required.
      const recipients = [
        { email: contract.parent1Email, name: `${contract.parent1FirstName} ${contract.parent1LastName}`, token: contract.parent1Token },
        {
          email: contract.projectManagerEmail,
          name: `${contract.projectManagerFirstName} ${contract.projectManagerLastName}`,
          token: contract.projectManagerToken,
        },
        {
          email: contract.structureManagerEmail,
          name: `${contract.structureManagerFirstName} ${contract.structureManagerLastName}`,
          token: contract.structureManagerToken,
        },
      ];
      if (contract.parent2Email)
        recipients.push({
          email: contract.parent2Email,
          name: `${contract.parent2FirstName} ${contract.parent2LastName}`,
          token: contract.parent2Token,
        });

      for (const recipient of recipients) {
        const htmlContent = fs
          .readFileSync(path.resolve(__dirname, "../templates/contract.html"))
          .toString()
          .replace(/{{toName}}/g, recipient.name)
          .replace(/{{youngName}}/g, `${contract.youngFirstName} ${contract.youngLastName}`)
          .replace(/{{cta}}/g, `https://inscription.snu.gouv.fr/validate-contract?token=${recipient.token}&contract=${data._id}`);
        const subject = `Valider le contrat d'engagement de ${contract.youngFirstName} ${contract.youngLastName} sur la mission ${contract.missionName}`;
        const to = { name: recipient.name, email: recipient.email };
        await sendEmail(to, subject, htmlContent);
      }
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

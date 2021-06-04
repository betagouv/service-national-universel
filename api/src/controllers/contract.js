const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { capture } = require("../sentry");
const ContractObject = require("../models/contract");
const ApplicationObject = require("../models/application");
const { ERRORS } = require("../utils");
const { sendEmail } = require("../sendinblue");

// Create or update token.
router.post("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    let contract = req.body;

    if (!contract._id) {
      // Create the tokens
      contract.parent1Token = crypto.randomBytes(40).toString("hex");
      contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
      contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
      if (contract.parent2Email) contract.parent2Token = crypto.randomBytes(40).toString("hex");

      contract.parent1Status = "WAITING_VALIDATION";
      contract.projectManagerStatus = "WAITING_VALIDATION";
      contract.structureManagerStatus = "WAITING_VALIDATION";
      if (contract.parent2Email) contract.parent2Status = "WAITING_VALIDATION";

      contract = await ContractObject.create(contract);
    } else {
      contract = await ContractObject.findById(contract._id);
    }

    // Update the application
    const application = await ApplicationObject.findById(contract.applicationId);
    application.contractId = contract._id;
    await application.save();

    if (req.body.sendMessage) {
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
          .replace(/{{cta}}/g, `https://inscription.snu.gouv.fr/validate-contract?token=${recipient.token}&contract=${contract._id}`);
        const subject = `Valider le contrat d'engagement de ${contract.youngFirstName} ${contract.youngLastName} sur la mission ${contract.missionName}`;
        const to = { name: recipient.name, email: recipient.email };
        await sendEmail(to, subject, htmlContent);
      }
      contract.invitationSent = "true";
      await contract.save();
    }
    return res.status(200).send({ ok: true, data: contract });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await ContractObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get a contract by its token.
router.get("/token/:token", async (req, res) => {
  try {
    const token = String(req.params.token);
    if (!token) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ContractObject.findOne({
      $or: [{ parent1Token: token }, { projectManagerToken: token }, { structureManagerToken: token }, { parent2Token: token }],
    });

    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const { parent1Token, projectManagerToken, structureManagerToken, parent2Token, ...rest } = data.toObject();
    return res.status(200).send({ ok: true, data: { ...rest, isParentToken: token === parent1Token || token === parent2Token } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Validate token.
router.post("/token/:token", async (req, res) => {
  try {
    const token = String(req.params.token);
    if (!token) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ContractObject.findOne({
      $or: [{ parent1Token: token }, { projectManagerToken: token }, { structureManagerToken: token }, { parent2Token: token }],
    });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (token === "parent1Token") data.parent1Status = "VALIDATED";
    if (token === "parent2Token") data.parent2Status = "VALIDATED";
    if (token === "projectManagerToken") data.projectManagerStatus = "VALIDATED";
    if (token === "structureManagerToken") data.structureManagerStatus = "VALIDATED";

    await data.save();

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const renderFromHtml = require("../htmlToPdf");
const { capture } = require("../sentry");
const ContractObject = require("../models/contract");
const YoungObject = require("../models/young");
const ApplicationObject = require("../models/application");
const ReferentObject = require("../models/referent");
const { ERRORS } = require("../utils");
const { sendEmail } = require("../sendinblue");
const { APP_URL } = require("../config");
const contractTemplate = require("../templates/contractPhase2");
const { ROLES } = require("snu-lib");

async function updateYoungStatusPhase2Contract(youngId) {
  const young = await YoungObject.findById(youngId);
  const contracts = await ContractObject.find({ youngId: young._id });
  young.set({
    statusPhase2Contract: contracts.map((contract) => {
      if (!contract.invitationSent || contract.invitationSent === "false") return "DRAFT";
      // To find if everybody has validated we count actual tokens and number of validated. It should be improved later.
      const tokenKeys = ["parent1Token", "parent2Token", "projectManagerToken", "structureManagerToken", "youngContractToken"];
      const tokenCount = tokenKeys.reduce((acc, current) => (Boolean(contract[current]) ? acc + 1 : acc), 0);
      const validateKeys = ["parent1Status", "parent2Status", "projectManagerStatus", "structureManagerStatus", "youngContractStatus"];
      const validatedCount = validateKeys.reduce((acc, current) => (contract[current] === "VALIDATED" ? acc + 1 : acc), 0);
      if (validatedCount >= tokenCount) {
        return "VALIDATED";
      } else {
        return "SENT";
      }
    }),
  });

  await young.save();
}

// Create or update contract.
router.post("/", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    let contract = req.body;
    let mailsToSend = [];
    let validateAgainMailList = [];

    if (!contract._id) {
      mailsToSend = ["projectManager", "structureManager"];
      // Create the tokens
      contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
      contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
      contract.projectManagerStatus = "WAITING_VALIDATION";
      contract.structureManagerStatus = "WAITING_VALIDATION";
      if (contract.isYoungAdult !== "true") {
        contract.parent1Token = crypto.randomBytes(40).toString("hex");
        contract.parent1Status = "WAITING_VALIDATION";
        mailsToSend.push("parent1");
        if (contract.parent2Email) {
          contract.parent2Token = crypto.randomBytes(40).toString("hex");
          contract.parent2Status = "WAITING_VALIDATION";
          mailsToSend.push("parent2");
        }
      } else {
        contract.youngContractToken = crypto.randomBytes(40).toString("hex");
        contract.youngContractStatus = "WAITING_VALIDATION";
        mailsToSend.push("young");
      }

      contract = await ContractObject.create(contract);
    } else {
      // We have to check if mail has changed (because we have to re-send one)
      const previous = await ContractObject.findById(contract._id);
      contract = await ContractObject.findByIdAndUpdate(contract._id, contract, { new: true });

      // When we update, we have to send mail again to validated.
      if (
        contract.isYoungAdult !== "true" &&
        (previous.invitationSent !== "true" || previous.parent1Status === "VALIDATED" || previous.parent1Email !== contract.parent1Email)
      ) {
        if (previous.parent1Status === "VALIDATED") validateAgainMailList.push("parent1");
        contract.parent1Status = "WAITING_VALIDATION";
        mailsToSend.push("parent1");
        contract.parent1Token = crypto.randomBytes(40).toString("hex");
      }
      if (
        previous.invitationSent !== "true" ||
        previous.projectManagerStatus === "VALIDATED" ||
        previous.projectManagerEmail !== contract.projectManagerEmail
      ) {
        if (previous.projectManagerStatus === "VALIDATED") validateAgainMailList.push("projectManager");
        contract.projectManagerStatus = "WAITING_VALIDATION";
        mailsToSend.push("projectManager");
        contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
      }
      if (
        previous.invitationSent !== "true" ||
        previous.structureManagerStatus === "VALIDATED" ||
        previous.structureManagerEmail !== contract.structureManagerEmail
      ) {
        if (previous.structureManagerStatus === "VALIDATED") validateAgainMailList.push("structureManager");
        contract.structureManagerStatus = "WAITING_VALIDATION";
        mailsToSend.push("structureManager");
        contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
      }
      if (
        contract.isYoungAdult !== "true" &&
        contract.parent2Email &&
        (previous.invitationSent !== "true" || previous.parent2Status === "VALIDATED" || previous.parent2Email !== contract.parent2Email)
      ) {
        if (previous.parent2Status === "VALIDATED") validateAgainMailList.push("parent2");
        contract.parent2Status = "WAITING_VALIDATION";
        mailsToSend.push("parent2");
        contract.parent2Token = crypto.randomBytes(40).toString("hex");
      }
      if (
        contract.isYoungAdult === "true" &&
        (previous.invitationSent !== "true" || previous.youngContractStatus === "VALIDATED" || previous.youngEmail !== contract.youngEmail)
      ) {
        if (previous.youngContractStatus === "VALIDATED") validateAgainMailList.push("young");
        contract.youngContractStatus = "WAITING_VALIDATION";
        mailsToSend.push("young");
        contract.youngContractToken = crypto.randomBytes(40).toString("hex");
      }
    }

    // Update the application
    const application = await ApplicationObject.findById(contract.applicationId);
    application.contractId = contract._id;
    await application.save();
    const departmentReferentPhase2 = await ReferentObject.findOne({
      department: contract.youngDepartment,
      subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
    });

    if (req.body.sendMessage) {
      // We send 2, 3 or 4 messages if required.
      const recipients = [];
      if (mailsToSend.includes("projectManager")) {
        recipients.push({
          email: contract.projectManagerEmail,
          name: `${contract.projectManagerFirstName} ${contract.projectManagerLastName}`,
          token: contract.projectManagerToken,
          cc: departmentReferentPhase2 ? departmentReferentPhase2.email : null,
          ccName: departmentReferentPhase2 ? `${departmentReferentPhase2.firstName} ${departmentReferentPhase2.lastName}` : null,
          isValidateAgainMail: validateAgainMailList.includes("projectManager"),
        });
      }
      if (mailsToSend.includes("structureManager")) {
        recipients.push({
          email: contract.structureManagerEmail,
          name: `${contract.structureManagerFirstName} ${contract.structureManagerLastName}`,
          token: contract.structureManagerToken,
          isValidateAgainMail: validateAgainMailList.includes("structureManager"),
        });
      }
      if (mailsToSend.includes("parent1")) {
        recipients.push({
          email: contract.parent1Email,
          name: `${contract.parent1FirstName} ${contract.parent1LastName}`,
          token: contract.parent1Token,
          cc: contract.youngEmail,
          ccName: `${contract.youngFirstName} ${contract.youngLastName}`,
          isValidateAgainMail: validateAgainMailList.includes("parent1"),
        });
      }
      if (contract.parent2Email && mailsToSend.includes("parent2")) {
        recipients.push({
          email: contract.parent2Email,
          name: `${contract.parent2FirstName} ${contract.parent2LastName}`,
          token: contract.parent2Token,
          cc: contract.youngEmail,
          ccName: `${contract.youngFirstName} ${contract.youngLastName}`,
          isValidateAgainMail: validateAgainMailList.includes("parent2"),
        });
      }
      if (mailsToSend.includes("young")) {
        recipients.push({
          email: contract.youngEmail,
          name: `${contract.youngFirstName} ${contract.youngLastName}`,
          token: contract.youngContractToken,
          isValidateAgainMail: validateAgainMailList.includes("young"),
        });
      }
      for (const recipient of recipients) {
        if (recipient.isValidateAgainMail) {
          console.log("send (re)validation mail to " + JSON.stringify({ to: recipient.email, cc: recipient.cc }));
          const htmlContent = fs
            .readFileSync(path.resolve(__dirname, "../templates/contract-revalidate.html"))
            .toString()
            .replace(/{{toName}}/g, recipient.name)
            .replace(/{{youngName}}/g, `${contract.youngFirstName} ${contract.youngLastName}`)
            .replace(/{{cta}}/g, `${APP_URL}/validate-contract?token=${recipient.token}&contract=${contract._id}`);
          const subject = `(RE)Valider le contrat d'engagement de ${contract.youngFirstName} ${contract.youngLastName} sur la mission ${contract.missionName} suite à modifications effectuées`;
          const to = { name: recipient.name, email: recipient.email };
          if (recipient.cc) {
            await sendEmail(to, subject, htmlContent, { cc: [{ name: recipient.ccName, email: recipient.cc }] });
          } else {
            await sendEmail(to, subject, htmlContent);
          }
        } else {
          console.log("send validation mail to " + JSON.stringify({ to: recipient.email, cc: recipient.cc }));
          const htmlContent = fs
            .readFileSync(path.resolve(__dirname, "../templates/contract.html"))
            .toString()
            .replace(/{{toName}}/g, recipient.name)
            .replace(/{{youngName}}/g, `${contract.youngFirstName} ${contract.youngLastName}`)
            .replace(/{{cta}}/g, `${APP_URL}/validate-contract?token=${recipient.token}&contract=${contract._id}`);
          const subject = `Valider le contrat d'engagement de ${contract.youngFirstName} ${contract.youngLastName} sur la mission ${contract.missionName}`;
          const to = { name: recipient.name, email: recipient.email };
          if (recipient.cc) {
            await sendEmail(to, subject, htmlContent, { cc: [{ name: recipient.ccName, email: recipient.cc }] });
          } else {
            await sendEmail(to, subject, htmlContent);
          }
        }
      }
      contract.invitationSent = "true";
      await contract.save();
    }

    await updateYoungStatusPhase2Contract(contract.youngId);

    return res.status(200).send({ ok: true, data: contract });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const data = await ContractObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (req.user.statusPhase2) {
      //         ^-- Quick and dirty way to check if it's a young.
      const { parent1Token, projectManagerToken, structureManagerToken, parent2Token, youngContractToken, ...rest } = data.toObject();
      return res.status(200).send({ ok: true, data: { ...rest } });
    }
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
      $or: [
        { youngContractToken: token },
        { parent1Token: token },
        { projectManagerToken: token },
        { structureManagerToken: token },
        { parent2Token: token },
      ],
    });

    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const { parent1Token, projectManagerToken, structureManagerToken, parent2Token, youngContractToken, ...rest } = data.toObject();
    return res.status(200).send({
      ok: true,
      data: { ...rest, isParentToken: token === parent1Token || token === parent2Token, isYoungContractToken: token === youngContractToken },
    });
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
      $or: [
        { youngContractToken: token },
        { parent1Token: token },
        { projectManagerToken: token },
        { structureManagerToken: token },
        { parent2Token: token },
      ],
    });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (token === data.parent1Token) data.parent1Status = "VALIDATED";
    if (token === data.parent2Token) data.parent2Status = "VALIDATED";
    if (token === data.projectManagerToken) data.projectManagerStatus = "VALIDATED";
    if (token === data.structureManagerToken) data.structureManagerStatus = "VALIDATED";
    if (token === data.youngContractToken) data.youngContractStatus = "VALIDATED";

    await data.save();

    await updateYoungStatusPhase2Contract(data.youngId);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:id/download", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  try {
    console.log(`${req.user.id} download contract ${req.params.id}`);
    const contract = await ContractObject.findById(req.params.id);
    if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const options = req.body.options || { format: "A4", margin: 0 };
    //create html
    const newhtml = await contractTemplate.render(contract);
    if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const buffer = await renderFromHtml(newhtml, options);
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/download/all", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    console.log(`${req.user.id} download all contracts`);
    const contracts = await ContractObject.find({ _id: { $in: ["60c20e380ec9bd07a05b2b7b", "60c31c28a7a6230790cbcec9"] } });
    if (!contracts || contracts.length === 0) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const output = fs.createWriteStream(__dirname + "/example.zip");
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    archive.pipe(output);

    const options = req.body.options || { format: "A4", margin: 0 };

    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const contractHtml = await contractTemplate.render(contract);
      if (!contractHtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const buffer = await renderFromHtml(contractHtml, options);
      archive.append(buffer, { name: `contract_${contract.id}.pdf` });
    }
    await archive.finalize();
    output.close();

    res.contentType("application/zip");
    res.setHeader("Content-Dispositon", 'inline; filename="test.zip"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(output);
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

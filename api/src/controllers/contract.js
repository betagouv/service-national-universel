const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");

const renderFromHtml = require("../htmlToPdf");
const { capture } = require("../sentry");
const ContractObject = require("../models/contract");
const YoungObject = require("../models/young");
const ApplicationObject = require("../models/application");
const ReferentObject = require("../models/referent");
const { ERRORS, isYoung } = require("../utils");
const { sendTemplate } = require("../sendinblue");
const { APP_URL } = require("../config");
const contractTemplate = require("../templates/contractPhase2");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");
const { validateId, validateContract, validateOptionalId } = require("../utils/validator");
const { serializeContract } = require("../utils/serializer");
const { updateYoungPhase2Hours, updateStatusPhase2 } = require("../utils");
const Joi = require("joi");

function checkStatusContract(contract) {
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
}

async function updateYoungStatusPhase2Contract(young, fromUser) {
  const contracts = await ContractObject.find({ youngId: young._id });
  young.set({
    statusPhase2Contract: contracts.map((contract) => checkStatusContract(contract)),
  });

  await young.save({ fromUser });
}

async function createContract(data, fromUser) {
  const { sendMessage } = data;
  const contract = await ContractObject.create(data);

  contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
  contract.projectManagerStatus = "WAITING_VALIDATION";
  if (sendMessage) await sendProjectManagerContractEmail(contract);

  contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
  contract.structureManagerStatus = "WAITING_VALIDATION";
  if (sendMessage) await sendStructureManagerContractEmail(contract);

  if (contract.isYoungAdult !== "true") {
    contract.parent1Token = crypto.randomBytes(40).toString("hex");
    contract.parent1Status = "WAITING_VALIDATION";
    if (sendMessage) await sendParent1ContractEmail(contract);
    if (contract.parent2Email) {
      contract.parent2Token = crypto.randomBytes(40).toString("hex");
      contract.parent2Status = "WAITING_VALIDATION";
      if (sendMessage) await sendParent2ContractEmail(contract);
    }
  } else {
    contract.youngContractToken = crypto.randomBytes(40).toString("hex");
    contract.youngContractStatus = "WAITING_VALIDATION";
    if (sendMessage) await sendYoungContractEmail(contract);
  }

  if (sendMessage) contract.invitationSent = "true";
  await contract.save({ fromUser });
  return contract;
}

async function updateContract(id, data, fromUser) {
  const { sendMessage } = data;
  const previous = await ContractObject.findById(id);
  const contract = await ContractObject.findById(id);
  contract.set(data);
  await contract.save({ fromUser });

  // When we update, we have to send mail again to validated.
  if (
    previous.invitationSent !== "true" ||
    previous.projectManagerStatus === "VALIDATED" ||
    previous.projectManagerEmail !== contract.projectManagerEmail
  ) {
    contract.projectManagerStatus = "WAITING_VALIDATION";
    contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendProjectManagerContractEmail(contract, previous.projectManagerStatus === "VALIDATED");
  }
  if (
    previous.invitationSent !== "true" ||
    previous.structureManagerStatus === "VALIDATED" ||
    previous.structureManagerEmail !== contract.structureManagerEmail
  ) {
    contract.structureManagerStatus = "WAITING_VALIDATION";
    contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendStructureManagerContractEmail(contract, previous.structureManagerStatus === "VALIDATED");
  }
  if (
    contract.isYoungAdult !== "true" &&
    (previous.invitationSent !== "true" || previous.parent1Status === "VALIDATED" || previous.parent1Email !== contract.parent1Email)
  ) {
    contract.parent1Status = "WAITING_VALIDATION";
    contract.parent1Token = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendParent1ContractEmail(contract, previous.parent1Status === "VALIDATED");
  }
  if (
    contract.isYoungAdult !== "true" &&
    contract.parent2Email &&
    (previous.invitationSent !== "true" || previous.parent2Status === "VALIDATED" || previous.parent2Email !== contract.parent2Email)
  ) {
    contract.parent2Status = "WAITING_VALIDATION";
    contract.parent2Token = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendParent2ContractEmail(contract, previous.parent2Status === "VALIDATED");
  }
  if (
    contract.isYoungAdult === "true" &&
    (previous.invitationSent !== "true" || previous.youngContractStatus === "VALIDATED" || previous.youngEmail !== contract.youngEmail)
  ) {
    contract.youngContractStatus = "WAITING_VALIDATION";
    contract.youngContractToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendYoungContractEmail(contract, previous.youngContractStatus === "VALIDATED");
  }

  if (sendMessage) contract.invitationSent = "true";
  await contract.save({ fromUser });
  return contract;
}

async function sendProjectManagerContractEmail(contract, isValidateAgainMail) {
  const departmentReferentPhase2 = await ReferentObject.findOne({
    department: contract.youngDepartment,
    subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
  });

  return sendContractEmail(contract, {
    email: contract.projectManagerEmail,
    name: `${contract.projectManagerFirstName} ${contract.projectManagerLastName}`,
    token: contract.projectManagerToken,
    cc: departmentReferentPhase2 ? departmentReferentPhase2.email : null,
    ccName: departmentReferentPhase2 ? `${departmentReferentPhase2.firstName} ${departmentReferentPhase2.lastName}` : null,
    isValidateAgainMail,
  });
}

async function sendStructureManagerContractEmail(contract, isValidateAgainMail) {
  return sendContractEmail(contract, {
    email: contract.structureManagerEmail,
    name: `${contract.structureManagerFirstName} ${contract.structureManagerLastName}`,
    token: contract.structureManagerToken,
    isValidateAgainMail,
  });
}

async function sendParent1ContractEmail(contract, isValidateAgainMail) {
  return sendContractEmail(contract, {
    email: contract.parent1Email,
    name: `${contract.parent1FirstName} ${contract.parent1LastName}`,
    token: contract.parent1Token,
    isValidateAgainMail,
  });
}

async function sendParent2ContractEmail(contract, isValidateAgainMail) {
  return sendContractEmail(contract, {
    email: contract.parent2Email,
    name: `${contract.parent2FirstName} ${contract.parent2LastName}`,
    token: contract.parent2Token,
    isValidateAgainMail,
  });
}

async function sendYoungContractEmail(contract, isValidateAgainMail) {
  return sendContractEmail(contract, {
    email: contract.youngEmail,
    name: `${contract.youngFirstName} ${contract.youngLastName}`,
    token: contract.youngContractToken,
    isValidateAgainMail,
  });
}

async function sendContractEmail(contract, options) {
  let template, cc;
  if (options.isValidateAgainMail) {
    console.log("send (re)validation mail to " + JSON.stringify({ to: options.email, cc: options.cc }));
    template = SENDINBLUE_TEMPLATES.REVALIDATE_CONTRACT;
  } else {
    console.log("send validation mail to " + JSON.stringify({ to: options.email, cc: options.cc }));
    template = SENDINBLUE_TEMPLATES.VALIDATE_CONTRACT;
  }
  const params = {
    toName: options.name,
    youngName: `${contract.youngFirstName} ${contract.youngLastName}`,
    missionName: contract.missionName,
    cta: `${APP_URL}/validate-contract?token=${options.token}&contract=${contract._id}`,
  };
  const emailTo = [{ name: options.name, email: options.email }];
  if (options.cc) {
    cc = [{ name: options.ccName, email: options.cc }];
  }
  await sendTemplate(template, {
    emailTo,
    params,
    cc,
  });
}

// Create or update contract.
router.post("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: idError, value: id } = validateOptionalId(req.body._id);
    if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: idError.message });
    const { error, value: data } = validateContract(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: error.message });

    // Create or update contract.
    const contract = id ? await updateContract(id, data, req.user) : await createContract(data, req.user);

    // Update the application.
    const application = await ApplicationObject.findById(contract.applicationId);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    application.contractId = contract._id;
    // We have to update the application's mission duration.
    application.missionDuration = contract.missionDuration;
    await application.save({ fromUser: req.user });

    // Update young status.
    const young = await YoungObject.findById(contract.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await updateYoungStatusPhase2Contract(young, req.user);
    await updateYoungPhase2Hours(young);
    await updateStatusPhase2(young);

    return res.status(200).send({ ok: true, data: serializeContract(contract, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

// Send contract email
router.post("/:id/send-email/:type", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: error.message });

    const { error: typeError, value: type } = Joi.string()
      .valid("projectManager", "structureManager", "parent1", "parent2", "young")
      .required()
      .validate(req.params.type);
    if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: typeError.message });

    const contract = await ContractObject.findById(id);
    if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (type === "projectManager") await sendProjectManagerContractEmail(contract, false);
    if (type === "structureManager") await sendStructureManagerContractEmail(contract, false);
    if (type === "parent1") await sendParent1ContractEmail(contract, false);
    if (type === "parent2") await sendParent2ContractEmail(contract, false);
    if (type === "young") await sendYoungContractEmail(contract, false);

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error: error.message });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: idError, value: id } = validateId(req.params.id);
    if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: idError.message });

    const data = await ContractObject.findById(id);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (isYoung(req.user) && data.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    return res.status(200).send({ ok: true, data: serializeContract(data, req.user) });
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

    return res.status(200).send({ ok: true, data: serializeContract(data, null, false) });
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

    await data.save({ fromUser: req.user });

    const young = await YoungObject.findById(data.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await updateYoungStatusPhase2Contract(young, req.user);

    // notify the young and parents when the contract has been validated by everyone.
    if (checkStatusContract(data) === "VALIDATED") {
      let emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];

      if (young.parent1FirstName && young.parent1LastName && young.parent1Email) {
        emailTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
      }
      if (young.parent2FirstName && young.parent2LastName && young.parent2Email) {
        emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      }

      await sendTemplate(SENDINBLUE_TEMPLATES.young.CONTRACT_VALIDATED, {
        emailTo,
        params: { missionName: data.missionName, cta: `${APP_URL}/candidature` },
      });
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/:id/download", passport.authenticate(["young", "referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: idError, value: id } = validateId(req.params.id);
    if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, message: idError.message });

    console.log(`${req.user.id} download contract ${id}`);

    const contract = await ContractObject.findById(id);
    if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // A young can only download their own documents.
    if (isYoung(req.user) && contract.youngId.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    // Create html
    const newhtml = await contractTemplate.render(contract);
    if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const buffer = await renderFromHtml(newhtml, { format: "A4", margin: 0 });
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

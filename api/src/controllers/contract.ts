import express, { Response } from "express";
import crypto from "crypto";
import {
  SENDINBLUE_TEMPLATES,
  getAge,
  ROLES,
  UserDto,
  ContractType,
  isAuthorized,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  isReadAuthorized,
  isWriteAuthorized,
  isCreateAuthorized,
  ReferentStatus,
} from "snu-lib";
import { capture } from "../sentry";
import { ContractModel, YoungModel, ApplicationModel, StructureModel, ReferentModel } from "../models";
import { ERRORS } from "../utils";
import { sendTemplate } from "../brevo";
import { config } from "../config";
import { logger } from "../logger";
import { validateId, validateContract, validateOptionalId, idSchema } from "../utils/validator";
import { serializeContract } from "../utils/serializer";
import { updateYoungPhase2StatusAndHours, updateYoungStatusPhase2Contract, checkStatusContract } from "../utils";
import Joi from "joi";
import patches from "./patches";
import { generatePdfIntoStream } from "../utils/pdf-renderer";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { accessControlMiddleware } from "../middlewares/accessControlMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { RouteRequest, RouteResponse, UserRequest } from "./request";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

async function createContract(data: any, fromUser: UserDto): Promise<ContractType> {
  const { sendMessage } = data;
  const contract = await ContractModel.create(data);
  const age = getAge(contract.youngBirthdate);
  const isYoungAdult = age !== "?" && age >= 18;

  contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
  contract.projectManagerStatus = "WAITING_VALIDATION";

  contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
  contract.structureManagerStatus = "WAITING_VALIDATION";

  contract.parent1Token = crypto.randomBytes(40).toString("hex");
  contract.parent1Status = "WAITING_VALIDATION";
  if (contract.parent2Email) {
    contract.parent2Token = crypto.randomBytes(40).toString("hex");
    contract.parent2Status = "WAITING_VALIDATION";
  }

  contract.youngContractToken = crypto.randomBytes(40).toString("hex");
  contract.youngContractStatus = "WAITING_VALIDATION";

  if (sendMessage) {
    await sendProjectManagerContractEmail(contract);
    await sendStructureManagerContractEmail(contract);
    if (isYoungAdult) {
      await sendYoungContractEmail(contract);
    } else {
      await sendParent1ContractEmail(contract);
      if (contract.parent2Email) {
        await sendParent2ContractEmail(contract);
      }
    }
    contract.invitationSent = "true";
  }

  await contract.save({ fromUser });
  return contract;
}

async function updateContract(id: string, data: any, fromUser: UserDto): Promise<ContractType> {
  const { sendMessage } = data;
  const contract = await ContractModel.findById(id);
  if (!contract) throw new Error(ERRORS.NOT_FOUND);
  const previous = JSON.parse(JSON.stringify(contract));
  contract.set(data);
  await contract.save({ fromUser });

  const age = getAge(contract.youngBirthdate);
  const isYoungAdult = age !== "?" && age >= 18;

  if (previous.invitationSent !== "true" || previous.projectManagerStatus === "VALIDATED" || previous.projectManagerEmail !== contract.projectManagerEmail) {
    contract.projectManagerStatus = "WAITING_VALIDATION";
    contract.projectManagerToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendProjectManagerContractEmail(contract, previous.projectManagerStatus === "VALIDATED");
  }
  if (previous.invitationSent !== "true" || previous.structureManagerStatus === "VALIDATED" || previous.structureManagerEmail !== contract.structureManagerEmail) {
    contract.structureManagerStatus = "WAITING_VALIDATION";
    contract.structureManagerToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendStructureManagerContractEmail(contract, previous.structureManagerStatus === "VALIDATED");
  }
  if (!isYoungAdult && (previous.invitationSent !== "true" || previous.parent1Status === "VALIDATED" || previous.parent1Email !== contract.parent1Email)) {
    contract.parent1Status = "WAITING_VALIDATION";
    contract.parent1Token = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendParent1ContractEmail(contract, previous.parent1Status === "VALIDATED");
  }
  if (!isYoungAdult && contract.parent2Email && (previous.invitationSent !== "true" || previous.parent2Status === "VALIDATED" || previous.parent2Email !== contract.parent2Email)) {
    contract.parent2Status = "WAITING_VALIDATION";
    contract.parent2Token = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendParent2ContractEmail(contract, previous.parent2Status === "VALIDATED");
  }
  if (isYoungAdult && (previous.invitationSent !== "true" || previous.youngContractStatus === "VALIDATED" || previous.youngEmail !== contract.youngEmail)) {
    contract.youngContractStatus = "WAITING_VALIDATION";
    contract.youngContractToken = crypto.randomBytes(40).toString("hex");
    if (sendMessage) await sendYoungContractEmail(contract, previous.youngContractStatus === "VALIDATED");
  }

  if (sendMessage) contract.invitationSent = "true";
  await contract.save({ fromUser });
  return contract;
}

async function sendProjectManagerContractEmail(contract: ContractType, isValidateAgainMail?: boolean): Promise<void> {
  const departmentReferentPhase2 = await ReferentModel.find({
    department: contract.youngDepartment,
    subRole: { $in: ["manager_department_phase2", "manager_phase2"] },
    status: ReferentStatus.ACTIVE,
  });

  return sendContractEmail(contract, {
    email: contract.projectManagerEmail,
    name: `${contract.projectManagerFirstName} ${contract.projectManagerLastName}`,
    token: contract.projectManagerToken,
    cc: departmentReferentPhase2.map((referent) => ({
      name: `${referent.firstName} ${referent.lastName}`,
      email: referent.email,
    })),
    isValidateAgainMail,
  });
}

async function sendStructureManagerContractEmail(contract: ContractType, isValidateAgainMail?: boolean): Promise<void> {
  try {
    if (contract.tutorEmail) {
      await sendContractEmail(contract, {
        email: contract.tutorEmail,
        name: `${contract.tutorFirstName} ${contract.tutorLastName}`,
        // @ts-ignore TODO: check if tutorToken is needed
        token: contract.tutorToken,
        isValidateAgainMail,
      });
    }
    if (contract.structureManagerEmail) {
      await sendContractEmail(contract, {
        email: contract.structureManagerEmail,
        name: `${contract.structureManagerFirstName} ${contract.structureManagerLastName}`,
        token: contract.structureManagerToken,
        isValidateAgainMail,
      });
    }
  } catch (e) {
    capture(e);
  }
}

async function sendParent1ContractEmail(contract: ContractType, isValidateAgainMail?: boolean): Promise<void> {
  return await sendContractEmail(contract, {
    email: contract.parent1Email,
    name: `${contract.parent1FirstName} ${contract.parent1LastName}`,
    token: contract.parent1Token,
    isValidateAgainMail,
  });
}

async function sendParent2ContractEmail(contract: ContractType, isValidateAgainMail?: boolean): Promise<void> {
  return await sendContractEmail(contract, {
    email: contract.parent2Email,
    name: `${contract.parent2FirstName} ${contract.parent2LastName}`,
    token: contract.parent2Token,
    isValidateAgainMail,
  });
}

async function sendYoungContractEmail(contract: ContractType, isValidateAgainMail?: boolean): Promise<void> {
  return await sendContractEmail(contract, {
    email: contract.youngEmail,
    name: `${contract.youngFirstName} ${contract.youngLastName}`,
    token: contract.youngContractToken,
    isValidateAgainMail,
  });
}

async function sendContractEmail(
  contract: ContractType,
  options: {
    email?: string;
    name: string;
    token?: string;
    cc?: Array<{ name: string; email: string }>;
    isValidateAgainMail?: boolean;
  },
): Promise<void> {
  try {
    let template, cc;
    if (options.isValidateAgainMail) {
      logger.debug(`send (re)validation mail to ${JSON.stringify({ to: options.email, cc: options.cc })}`);
      template = SENDINBLUE_TEMPLATES.REVALIDATE_CONTRACT;
    } else {
      logger.debug(`send validation mail to ${JSON.stringify({ to: options.email, cc: options.cc })}`);
      template = SENDINBLUE_TEMPLATES.VALIDATE_CONTRACT;
    }
    const params = {
      toName: options.name,
      youngName: `${contract.youngFirstName} ${contract.youngLastName}`,
      missionName: contract.missionName,
      cta: `${config.APP_URL}/validate-contract?token=${options.token}&contract=${contract._id}`,
    };
    const emailTo = [{ name: options.name, email: options.email! }];
    if (options?.cc?.length) {
      cc = options.cc;
    }
    await sendTemplate(template, {
      emailTo,
      params,
      cc,
    });
  } catch (e) {
    capture(e);
  }
}

const router = express.Router();

// Create or update contract.
router.post(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([
    { resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true },
    { resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.CREATE, ignorePolicy: true },
  ]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error: idError, value: id } = validateOptionalId(req.body._id);
      if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const { error, value: data } = validateContract(req.body);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      let previousStructureId, currentStructureId;
      if (id) {
        if (!isWriteAuthorized({ resource: PERMISSION_RESOURCES.CONTRACT, user: req.user })) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
        const contract = await ContractModel.findById(id);
        if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        previousStructureId = contract.structureId;
        currentStructureId = data.structureId || contract.structureId;
      } else {
        if (!isCreateAuthorized({ resource: PERMISSION_RESOURCES.CONTRACT, user: req.user })) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
        previousStructureId = data.structureId;
        currentStructureId = data.structureId;
      }
      if (req.user.role === ROLES.RESPONSIBLE) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (previousStructureId.toString() !== req.user.structureId.toString() || currentStructureId.toString() !== req.user.structureId.toString()) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures.map((e) => e._id.toString()).includes(previousStructureId.toString()) || !structures.map((e) => e._id.toString()).includes(currentStructureId.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }

      const contract = id ? await updateContract(id, data, req.user) : await createContract(data, req.user);
      const application = await ApplicationModel.findById(contract.applicationId);
      if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      application.contractId = contract._id;
      application.missionDuration = contract.missionDuration;
      await application.save({ fromUser: req.user });

      const young = await YoungModel.findById(contract.youngId);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      await updateYoungStatusPhase2Contract(young, req.user);
      await updateYoungPhase2StatusAndHours(young, req.user);

      return res.status(200).send({ ok: true, data: serializeContract(contract, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// Send contract email
router.post(
  "/:id/send-email/:type",
  authMiddleware(["referent"]),
  [permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }])],
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: id } = validateId(req.params.id);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { error: typeError, value: type } = Joi.string().valid("projectManager", "structureManager", "parent1", "parent2", "young").required().validate(req.params.type);
      if (typeError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const contract = await ContractModel.findById(id);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (!isWriteAuthorized({ resource: PERMISSION_RESOURCES.CONTRACT, user: req.user, context: { contract: contract.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
      if (req.user.role === ROLES.RESPONSIBLE) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        if (contract.structureId?.toString() !== req.user.structureId.toString()) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }
      if (req.user.role === ROLES.SUPERVISOR) {
        if (!req.user.structureId) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
        const structures = await StructureModel.find({ $or: [{ networkId: String(req.user.structureId) }, { _id: String(req.user.structureId) }] });
        if (!structures.map((e) => e._id.toString()).includes(contract.structureId?.toString())) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
        }
      }

      if (type === "projectManager") await sendProjectManagerContractEmail(contract, false);
      if (type === "structureManager") await sendStructureManagerContractEmail(contract, false);
      if (type === "parent1") await sendParent1ContractEmail(contract, false);
      if (type === "parent2") await sendParent2ContractEmail(contract, false);
      if (type === "young") await sendYoungContractEmail(contract, false);

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id",
  authMiddleware(["referent", "young"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const { error: idError, value: id } = validateId(req.params.id);
      if (idError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const data = await ContractModel.findById(id);
      if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (!isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.CONTRACT, context: { contract: data.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      return res.status(200).send({ ok: true, data: serializeContract(data, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/patches",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN]),
  ],
  async (req: UserRequest, res: Response) => {
    try {
      const { id } = req.params;

      const contract = await ContractModel.findById(id);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const contractPatches = await patches.get(req, ContractModel);
      if (!contractPatches) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data: contractPatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

// Get a contract by its token.
router.get("/token/:token", async (req: UserRequest, res: Response) => {
  try {
    const token = String(req.params.token);
    if (!token) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ContractModel.findOne({
      $or: [{ youngContractToken: token }, { parent1Token: token }, { projectManagerToken: token }, { structureManagerToken: token }, { parent2Token: token }],
    });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeContract(data, null, false) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Validate token.
router.post("/token/:token", async (req: UserRequest, res: Response) => {
  try {
    const token = String(req.params.token);
    if (!token) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const data = await ContractModel.findOne({
      $or: [{ youngContractToken: token }, { parent1Token: token }, { projectManagerToken: token }, { structureManagerToken: token }, { parent2Token: token }],
    });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (token === data.parent1Token) {
      data.parent1Status = "VALIDATED";
      data.parent1ValidationDate = new Date();
    }
    if (token === data.parent2Token) {
      data.parent2Status = "VALIDATED";
      data.parent2ValidationDate = new Date();
    }
    if (token === data.projectManagerToken) {
      data.projectManagerStatus = "VALIDATED";
      data.projectManagerValidationDate = new Date();
    }
    if (token === data.structureManagerToken) {
      data.structureManagerStatus = "VALIDATED";
      data.structureManagerValidationDate = new Date();
    }
    if (token === data.youngContractToken) {
      data.youngContractStatus = "VALIDATED";
      data.youngContractValidationDate = new Date();
    }

    const application = await ApplicationModel.findById(data.applicationId);
    if (!application) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const young = await YoungModel.findById(data.youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await data.save({ fromUser: req.user });

    await updateYoungStatusPhase2Contract(young, req.user);

    const contractStatus = checkStatusContract(data);

    application.set({ contractStatus });
    await application.save({ fromUser: req.user });

    if (contractStatus === "VALIDATED") {
      let emailTo = [{ name: `${young.firstName} ${young.lastName}`, email: young.email }];

      if (young.parent1FirstName && young.parent1LastName && young.parent1Email) {
        emailTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email });
      }
      if (young.parent2FirstName && young.parent2LastName && young.parent2Email) {
        emailTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email });
      }

      await sendTemplate(SENDINBLUE_TEMPLATES.young.CONTRACT_VALIDATED, {
        emailTo,
        params: {
          missionName: data.missionName,
          cta: `${config.APP_URL}/candidature?utm_campaign=transactionnel+contrat+engagement+signe&utm_source=notifauto&utm_medium=mail+183+telecharger`,
        },
      });
    }

    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/:id/download",
  authMiddleware(["young", "referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.CONTRACT, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const contract = await ContractModel.findById(req.validatedParams.id);
      if (!contract) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (
        !isAuthorized({
          resource: PERMISSION_RESOURCES.CONTRACT,
          action: PERMISSION_ACTIONS.READ,
          user: req.user,
          context: { contract: contract.toJSON() },
        })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      await generatePdfIntoStream(res, { type: "contract", template: "2", contract });
    } catch (e) {
      capture(e);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;

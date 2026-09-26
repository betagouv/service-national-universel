import express, { Response } from "express";
import passport from "passport";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Joi from "joi";
import mime from "mime-types";
import fs from "fs";
import fileUpload from "express-fileupload";

import { decrypt, encrypt } from "../../cryptoUtils";
import { config } from "../../config";
import { logger } from "../../logger";
import { capture } from "../../sentry";
import {
  ReferentModel,
  YoungModel,
  ApplicationModel,
  SessionPhase1Model,
  LigneBusModel,
  ClasseModel,
  EtablissementModel,
  CohortModel,
  ApplicationDocument,
  MissionEquivalenceModel,
  YoungDocument,
} from "../../models";
import AuthObject from "../../auth";
import { signinRateLimiter, emailSendingRateLimiter, userRateLimiter } from "../../middlewares/rateLimit";
import { requireJsonBody } from "../../middlewares/requireJsonBody";
import { uploadFile, validatePassword, ERRORS, inSevenDays, isYoung, isReferent, updatePlacesSessionPhase1, getCcOfYoung, getFile, updateSeatsTakenInBusLine } from "../../utils";
import { getMimeFromFile, getMimeFromBuffer } from "../../utils/file";
import { sendTemplate, unsync } from "../../brevo";
import { cookieOptions, COOKIE_SIGNIN_MAX_AGE_MS } from "../../cookie-options";
import { validateYoung, validateId, idSchema } from "../../utils/validator";
import patches from "../patches";
import { serializeYoung, serializeApplication, serializeContract, serializeMission } from "../../utils/serializer";
import { youngPerimeterMiddleware } from "./youngPerimeterMiddleware";
import {
  canAccessYoungDocumentsInScope,
  canEditYoungInScope,
  canViewYoungFileInScope,
  getApplicationScopeFilter,
  isYoungInReferentGeography,
  isYoungInUserScope,
} from "../../young/youngScope";
import { purgeYoungFiles } from "../../young/youngFilesPurge";
import {
  canDeleteYoung,
  canGetYoungByEmail,
  canInviteYoung,
  canDeletePatchesHistory,
  SENDINBLUE_TEMPLATES,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS,
  ROLES,
  YOUNG_STATUS_PHASE2,
  YOUNG_STATUS_PHASE3,
  YOUNG_SOURCE,
  youngCanChangeSession,
  youngCanWithdraw,
  REGLEMENT_INTERIEUR_VERSION,
  getDepartmentForInscriptionGoal,
  FUNCTIONAL_ERRORS,
  CohortDto,
  MissionType,
  ContractType,
  CohortType,
  ReferentType,
  WITHRAWN_REASONS,
  PERMISSION_RESOURCES,
  isReadAuthorized,
  PERMISSION_CODES,
  PERMISSION_ACTIONS,
  ReferentStatus,
} from "snu-lib";
import { getFilteredSessionsForChangementSejour } from "../../cohort/cohortService";
import { anonymizeApplicationsFromYoungId } from "../../application/applicationService";
import { anonymizeContractsFromYoungId } from "../../services/contract";
import { keepOnlyUnsharedEmails } from "../../services/rgpdEmailGuard";
import { getCompletionObjectifs } from "../../services/inscription-goal";
import { JWT_SIGNIN_VERSION, JWT_SIGNIN_MAX_AGE_SEC } from "../../jwt-options";
import { scanFile } from "../../utils/virusScanner";
import emailsEmitter from "../../emails";
import { UserRequest } from "../request";
import { FileTypeResult } from "file-type";
import { requestValidatorMiddleware } from "../../middlewares/requestValidatorMiddleware";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { accessControlMiddleware } from "../../middlewares/accessControlMiddleware";
import { handleNotifForYoungWithdrawn } from "../../young/youngService";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

const router = express.Router();
const YoungAuth = new AuthObject(YoungModel);

// Lot C de l'audit du 21/09/2026 : quota par IP sur les routes publiques d'auth,
// que les compteurs par compte ne couvrent pas (énumération, password spraying,
// abus des routes qui envoient un email ou réécrivent un token).
const youngSigninLimiter = signinRateLimiter();

// PM19 (audit du 25/09/2026) : la soumission de mission phase 3 envoie un email officiel au tuteur
// renseigné par le volontaire, sans aucune limite de débit.
const validateMissionPhase3Limiter = userRateLimiter({ prefix: "young-validate-mission-phase3", windowMs: 60 * 60 * 1000, limit: 10 });

// M3 de l'audit du 21/09/2026 : l'inscription en ligne est fermée
// (`/preinscription` redirige vers snu.gouv.fr/inscriptions-cloturees et plus
// aucun appelant de cette route ne subsiste dans le dépôt). Tant qu'elle
// répondait, elle restait un oracle d'énumération : le triplet prénom / nom /
// date de naissance permettait de savoir anonymement si une personne est
// inscrite. Un code d'erreur uniformisé n'y aurait rien changé — « compte
// créé » contre « compte pas créé » reste discriminant sur une route
// d'inscription publique. Même fermeture que POST /referent/signup.
// À rouvrir explicitement — avec un rate limiter — quand les inscriptions
// reprennent ; la porte de cohorte de signupVolontaire reste en place.
router.post("/signup", (_req, res) => {
  return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
});
// PH17 de l'audit du 25/09/2026 : `/signup/email` (changeEmailDuringSignUp) appliquait le nouvel
// email en base avant toute validation par le jeton envoyé à cette adresse — vecteur secondaire pour
// usurper l'identité support d'un tiers. Sans appelant (les inscriptions sont fermées depuis M3
// ci-dessus), la route est supprimée plutôt que corrigée.
router.post("/signin", youngSigninLimiter, requireJsonBody, (req, res) => YoungAuth.signin(req, res));
router.post("/signin-2fa", youngSigninLimiter, requireJsonBody, (req, res) => YoungAuth.signin2FA(req, res));
router.post("/email", emailSendingRateLimiter("young-email-update"), passport.authenticate("young", { session: false, failWithError: true }), (req, res) =>
  YoungAuth.requestEmailUpdate(req, res),
);
router.post("/email-validation/new-email", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.validateEmailUpdate(req, res));
router.post("/email-validation", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.validateEmail(req, res));
router.get(
  "/email-validation/token",
  emailSendingRateLimiter("young-email-validation-token"),
  passport.authenticate("young", { session: false, failWithError: true }),
  (req, res) => YoungAuth.requestNewEmailValidationToken(req, res),
);
router.post("/logout", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.logout(req, res));
router.get("/signin_token", passport.authenticate("young", { session: false, failWithError: true }), (req, res) => YoungAuth.signinToken(req, res));
router.post("/forgot_password", emailSendingRateLimiter("young-forgot-password"), async (req: UserRequest, res) =>
  YoungAuth.forgotPassword(req, res, `${config.APP_URL}/auth/reset`),
);
router.post("/forgot_password_reset", youngSigninLimiter, async (req: UserRequest, res) => YoungAuth.forgotPasswordReset(req, res));
router.post("/reset_password", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => YoungAuth.resetPassword(req, res));
router.post("/check_password", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => YoungAuth.checkPassword(req, res));

// PL3 (25/09/2026) : par parité avec referentSigninLimiter, déjà posé côté référent sur la route
// équivalente.
router.post("/signup_verify", youngSigninLimiter, async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({ invitationToken: Joi.string().required() }).unknown().validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findOne({ invitationToken: value.invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.INVITATION_TOKEN_EXPIRED_OR_INVALID });
    // Pré-remplissage du formulaire d'activation uniquement : aucune session n'est ouverte ici.
    // Cette route délivrait un JWT de session complet contre le seul jeton d'invitation, sans mot de
    // passe (audit 2026-09-21, M43) ; c'est `signup_invite` qui authentifie, à partir du couple
    // (email, invitationToken) et sans lire de JWT.
    return res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// PL3 (rate limiter) + PM31 (requireJsonBody, déjà posé sur /signin) : cette route ouvre une session
// complète contre email + mot de passe + jeton d'invitation, comme /signin.
router.post("/signup_invite", youngSigninLimiter, requireJsonBody, async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      invitationToken: Joi.string().required(),
      email: Joi.string().lowercase().trim().email().required(),
      password: Joi.string().required(),
    })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { email, password, invitationToken } = value;
    const young = await YoungModel.findOne({ email, invitationToken, invitationExpires: { $gt: Date.now() } });
    if (!young) return res.status(404).send({ ok: false, data: null, code: ERRORS.USER_NOT_FOUND });

    // @ts-expect-error FIXME: legacy field ?
    if (young.registredAt) return res.status(400).send({ ok: false, data: null, code: ERRORS.YOUNG_ALREADY_REGISTERED });

    if (!validatePassword(password)) return res.status(400).send({ ok: false, prescriber: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

    young.set({ password });
    young.set({ registredAt: Date.now() });
    young.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
    young.set({ invitationToken: "" });
    young.set({ invitationExpires: null });

    const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: young._id, passwordChangedAt: null, lastLogoutAt: null }, config.JWT_SECRET, { expiresIn: JWT_SIGNIN_MAX_AGE_SEC });
    res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS) as any);

    await young.save({ fromUser: req.user });

    return res.status(200).send({ data: serializeYoung(young, young), ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/file/:key",
  passport.authenticate("young", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res) => {
    try {
      const rootKeys = [
        "cniFiles",
        "highSkilledActivityProofFiles",
        "parentConsentmentFiles",
        "imageRightFiles",
        "dataProcessingConsentmentFiles",
        "rulesFiles",
        "equivalenceFiles",
      ];
      const militaryKeys = ["militaryPreparationFilesIdentity", "militaryPreparationFilesCensus", "militaryPreparationFilesAuthorization", "militaryPreparationFilesCertificate"];
      const { error: keyError, value: key } = Joi.string()
        .required()
        .valid(...[...rootKeys, ...militaryKeys])
        .validate(req.params.key, { stripUnknown: true });
      if (keyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { error: bodyError, value: body } = Joi.string().required().validate(req.body.body);
      if (bodyError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      if (key !== "equivalenceFiles") throw "Route deprecated.";

      const {
        error: namesError,
        value: { names },
      } = Joi.object({ names: Joi.array().items(Joi.string()).required() }).validate(JSON.parse(body), { stripUnknown: true });
      if (namesError) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      const user = await YoungModel.findById(req.user._id);
      if (!user) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

      const files = Object.keys(req.files || {}).map((e) => req.files[e]);
      for (let i = 0; i < files.length; i++) {
        let currentFile = files[i];
        // If multiple file with same names are provided, currentFile is an array. We just take the latest.
        if (Array.isArray(currentFile)) {
          currentFile = currentFile[currentFile.length - 1];
        }
        const { name, tempFilePath, mimetype } = currentFile;
        const mimeFromMagicNumbers = await getMimeFromFile(tempFilePath);
        const validTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers!))) {
          fs.unlinkSync(tempFilePath);
          return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
        }

        const scanResult = await scanFile(tempFilePath, name, req.user._id);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        }

        const data = fs.readFileSync(tempFilePath);
        const encryptedBuffer = encrypt(data);
        const resultingFile = { mimetype: mimeFromMagicNumbers, encoding: "7bit", data: encryptedBuffer };
        if (militaryKeys.includes(key)) {
          await uploadFile(`app/young/${user._id}/military-preparation/${key}/${name}`, resultingFile);
        } else {
          await uploadFile(`app/young/${user._id}/${key}/${name}`, resultingFile);
        }
        fs.unlinkSync(tempFilePath);
      }
      user.set({ [key]: names });
      await user.save({ fromUser: req.user });

      return res.status(200).send({ young: serializeYoung(user, user), data: names, ok: true });
    } catch (error) {
      capture(error);
      if (error === "FILE_CORRUPTED") return res.status(500).send({ ok: false, code: ERRORS.FILE_CORRUPTED });
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post("/invite", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = validateYoung(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const cohortDocument = await CohortModel.findById(value.cohortId);
    const cohortDto: CohortDto | null = cohortDocument ? (cohortDocument.toObject() as CohortDto) : null;

    if (!canInviteYoung(req.user, cohortDto)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    const obj = { ...value };

    if (!obj.cohortId) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const cohort = await CohortModel.findById(obj.cohortId);
    if (!cohort) {
      return res.status(404).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    obj.cohort = cohort.name;
    obj.acceptRI = REGLEMENT_INTERIEUR_VERSION;

    const formatedDate = new Date(obj.birthdateAt).setUTCHours(11, 0, 0);
    obj.birthdateAt = formatedDate;

    const invitation_token = crypto.randomBytes(20).toString("hex");
    obj.invitationToken = invitation_token;
    obj.invitationExpires = inSevenDays(); // 7 days

    obj.country = "France";

    obj.parent1ContactPreference = "email";
    obj.parent2ContactPreference = "email";
    obj.status = YOUNG_STATUS.IN_PROGRESS;

    obj.inscriptionDoneDate = new Date();
    if (obj.classeId) {
      obj.source = YOUNG_SOURCE.CLE;
      const classe = await ClasseModel.findById(obj.classeId);
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      obj.etablissementId = classe.etablissementId;
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (etablissement) {
        obj.schoolName = etablissement.name;
        obj.schoolType = etablissement.type[0];
        obj.schoolAddress = etablissement.address;
        obj.schoolZip = etablissement.zip;
        obj.schoolCity = etablissement.city;
        obj.schoolDepartment = etablissement.department;
        obj.schoolRegion = etablissement.region;
        obj.schoolCountry = etablissement.country;
        obj.schoolId = etablissement.schoolId;
      }
    }

    if (obj.source !== YOUNG_SOURCE.CLE && value.status === YOUNG_STATUS.VALIDATED) {
      const departement = getDepartmentForInscriptionGoal(obj);
      const completionObjectif = await getCompletionObjectifs(departement, cohort);
      if (completionObjectif.isAtteint) {
        return res.status(400).send({
          ok: false,
          code: completionObjectif.region.isAtteint ? FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED : FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REACHED,
        });
      }
    }

    //creating IN_PROGRESS for data
    const young = await YoungModel.create({ ...obj, fromUser: req.user });

    young.set({ status: YOUNG_STATUS.WAITING_VALIDATION });
    await young.save({ fromUser: req.user });

    const toName = `${young.firstName} ${young.lastName}`;
    const cta = `${config.APP_URL}/auth/signup/invite?token=${invitation_token}&utm_campaign=transactionnel+compte+cree&utm_source=notifauto&utm_medium=mail+166+activer`;
    const fromName = `${req.user.firstName} ${req.user.lastName}`;
    await sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_YOUNG, {
      emailTo: [{ name: toName, email: young.email }],
      params: { toName, cta, fromName },
    });

    return res.status(200).send({ young: serializeYoung(young, req.user), ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Le lien de validation phase 3 est envoyé au tuteur, à une adresse saisie par le jeune : son porteur
// ne reçoit que ce dont la page de validation a besoin, pas le dossier du volontaire (santé, parents,
// adresse, jetons) qu'exposait `serializeYoung(data, data)` (audit 2026-09-21, M44).
const PHASE3_TUTOR_VIEW_FIELDS = [
  "_id",
  "firstName",
  "lastName",
  "cohort",
  "statusPhase3",
  "phase3StructureName",
  "phase3MissionDomain",
  "phase3MissionDescription",
  "phase3MissionStartAt",
  "phase3MissionEndAt",
  "phase3TutorFirstName",
  "phase3TutorLastName",
  "phase3TutorEmail",
  "phase3TutorPhone",
  "phase3TutorNote",
] as const;

function serializeYoungForPhase3Tutor(young: YoungDocument) {
  const data = young.toObject();
  return Object.fromEntries(PHASE3_TUTOR_VIEW_FIELDS.map((field) => [field, data[field]]));
}

router.get("/validate_phase3/:young/:token", async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      token: Joi.string().required(),
    })
      .unknown()
      .validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungModel.findOne({ _id: value.young, phase3Token: value.token });
    if (!data) {
      capture(`Young not found ${req.params.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(200).send({ ok: true, data: serializeYoungForPhase3Tutor(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/validate_phase3/:young/:token", async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      token: Joi.string().required(),
      phase3TutorNote: Joi.string().optional(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungModel.findOne({ _id: value.young, phase3Token: value.token });

    if (!data) {
      capture(`Young not found ${value.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // Le lien du tuteur est à usage unique : le jeton est effacé à la validation, pour qu'un lien transféré
    // ou retrouvé dans une boîte mail ne permette plus ni de relire la mission ni de la revalider.
    data.set({
      statusPhase3: "VALIDATED",
      statusPhase3UpdatedAt: Date.now(),
      statusPhase3ValidatedAt: Date.now(),
      phase3TutorNote: value.phase3TutorNote,
      phase3Token: "",
    });
    await data.save({ fromUser: req.user });

    let template = SENDINBLUE_TEMPLATES.young.VALIDATE_PHASE3;
    let cc = getCcOfYoung({ template, young: data });
    await sendTemplate(template, {
      emailTo: [{ name: `${data.firstName} ${data.lastName}`, email: data.email }],
      params: { cta: `${config.APP_URL}/phase3?utm_campaign=transactionnel+phase3+terminee&utm_source=notifauto&utm_medium=mail+200+telecharger` },
      cc,
    });

    return res.status(200).send({ ok: true, data: serializeYoungForPhase3Tutor(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/update_phase3/:young", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      young: Joi.string().required(),
      phase3StructureName: Joi.string().required(),
      phase3MissionDescription: Joi.string().required(),
      phase3TutorFirstName: Joi.string().required(),
      phase3TutorLastName: Joi.string().required(),
      phase3TutorEmail: Joi.string().lowercase().trim().email().required(),
      phase3TutorPhone: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await YoungModel.findOne({ _id: value.young });

    if (!data) {
      capture(`Young not found ${value.young}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // `canEditYoung` n'est qu'une matrice de rôles : elle autorise tout référent CLE sur tout
    // volontaire `source: CLE`, sans vérifier sa classe (constat L23).
    if (!(await canEditYoungInScope(req.user, data))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

    delete value.young;
    data.set({ ...value, statusPhase3UpdatedAt: Date.now() });
    await data.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/:id/patches",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    accessControlMiddleware([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE]),
  ],
  async (req: UserRequest, res) => {
    try {
      const { id } = req.params;

      const young = await YoungModel.findById(id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // `patches.get` lit USER_HISTORY/PATCH avec `ignorePolicy` : le périmètre doit être vérifié ici.
      if (!(await isYoungInUserScope(req.user, young))) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const youngPatches = await patches.get(req, YoungModel, young);
      if (!youngPatches) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      return res.status(200).send({ ok: true, data: youngPatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put("/:id/validate-mission-phase3", passport.authenticate("young", { session: false, failWithError: true }), validateMissionPhase3Limiter, async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      phase3StructureName: Joi.string().optional().allow(null, ""),
      phase3MissionDomain: Joi.string().optional().allow(null, ""),
      phase3MissionDescription: Joi.string().optional().allow(null, ""),
      phase3MissionStartAt: Joi.string().optional().allow(null, ""),
      phase3MissionEndAt: Joi.string().optional().allow(null, ""),
      phase3TutorFirstName: Joi.string().optional().allow(null, ""),
      phase3TutorLastName: Joi.string().optional().allow(null, ""),
      phase3TutorEmail: Joi.string().lowercase().trim().email().optional().allow(null, ""),
      phase3TutorPhone: Joi.string().optional().allow(null, ""),
      // Pas de `statusPhase3` ni de `.unknown()` : avec `.unknown()`, `stripUnknown` ne retire rien et
      // tout champ du body finissait dans `young.set` (audit 2026-09-21, M45).
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(value.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // young can only update their own mission phase3.
    if (isYoung(req.user) && young._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    // Une mission validée par le tuteur ne se réécrit plus : le jeune ne peut pas substituer une autre
    // mission à celle qui a été attestée.
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }
    // PM19 : le volontaire choisit librement l'adresse du « tuteur » qui valide sa mission ; sans ce
    // garde, il se valide lui-même (ou fait valider par un parent) en renseignant sa propre adresse.
    if (value.phase3TutorEmail) {
      const selfEmails = [young.email, young.parent1Email, young.parent2Email].filter(Boolean).map((email) => email!.toLowerCase());
      if (selfEmails.includes(value.phase3TutorEmail.toLowerCase())) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }
    }
    // eslint-disable-next-line no-unused-vars
    const { id, ...values } = value;
    values.phase3Token = crypto.randomBytes(20).toString("hex");

    // Le statut est fixé par le serveur : la soumission ouvre l'attente de validation par le tuteur.
    young.set({ ...values, statusPhase3: YOUNG_STATUS_PHASE3.WAITING_VALIDATION, statusPhase3UpdatedAt: Date.now() });
    await young.save({ fromUser: req.user });

    const youngName = `${young.firstName} ${young.lastName}`;
    const toName = `${young.phase3TutorFirstName} ${young.phase3TutorLastName}`;
    const structureName = young.phase3StructureName;
    const startAt = young.phase3MissionStartAt?.toLocaleDateString("fr");
    const endAt = young.phase3MissionEndAt?.toLocaleDateString("fr");
    const cta = `${config.ADMIN_URL}/validate?token=${young.phase3Token}&young_id=${young._id}`;

    await sendTemplate(SENDINBLUE_TEMPLATES.referent.VALIDATE_MISSION_PHASE3, {
      emailTo: [{ name: toName, email: young.phase3TutorEmail! }],
      params: { toName, youngName, structureName, startAt, endAt, cta },
    });
    // @ts-expect-error not required ("" or null)
    young.phase3Token = null;

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/accept-cgu", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ acceptCGU: "true" });
    await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(young, young) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/change-cohort", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await getFilteredSessionsForChangementSejour(young, (req.headers["x-user-timezone"] || "") as string);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

const changeCohortValidator = Joi.object({
  cohortId: Joi.string(),
  cohortName: Joi.string(),
  cohortChangeReason: Joi.string().required(),
  cohortDetailedChangeReason: Joi.string().required(),
}).xor("cohortId", "cohortName");

router.put("/change-cohort", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = changeCohortValidator.validate(req.body, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(req.user._id);

    if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });
    if (!youngCanChangeSession(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const { cohortName, cohortId, cohortChangeReason, cohortDetailedChangeReason } = value;

    const previousYoung = { ...young.toObject() };
    const cohortObj = await CohortModel.findOne({
      $or: [{ _id: cohortId }, { name: cohortName }],
    });
    if (!cohortObj) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const oldSessionPhase1Id = young.sessionPhase1Id;
    const oldBusId = young.ligneId;
    const oldCohort = young.cohort;
    if (young.cohort !== cohortName && (young.sessionPhase1Id || young.meetingPointId || young.ligneId)) {
      young.set({
        cohesionCenterId: undefined,
        sessionPhase1Id: undefined,
        meetingPointId: undefined,
        ligneId: undefined,
        deplacementPhase1Autonomous: undefined,
        transportInfoGivenByLocal: undefined,
        cohesionStayPresence: undefined,
        presenceJDM: undefined,
        departInform: undefined,
        departSejourAt: undefined,
        departSejourMotif: undefined,
        departSejourMotifComment: undefined,
        youngPhase1Agreement: "false",
        hasMeetingInformation: undefined,
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
      });
    }

    // si le volontaire change pour la première fois de cohorte, on stocke sa cohorte d'origine
    if (!young.originalCohort) {
      young.set({ originalCohort: young.cohort });
    }

    if (cohortName !== "à venir") {
      const sessions = await getFilteredSessionsForChangementSejour(young, (req.headers["x-user-timezone"] || "") as string);
      const session = sessions.find(({ name }) => name === cohortObj.name);
      if (!session) {
        return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      const status = await getStatusAfterChangementSejour(young.status, young.department!, cohortObj);
      young.set({ status });
    }

    young.set({
      cohort: cohortObj.name,
      originalCohort: oldCohort,
      cohortId: cohortObj._id,
      cohortChangeReason,
      cohortDetailedChangeReason,
      cohesionStayPresence: undefined,
      cohesionStayMedicalFileReceived: undefined,
    });

    await young.save({ fromUser: req.user });

    // if they had a session, we check if we need to update the places taken / left
    if (oldSessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1Model.findById(oldSessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    // if they had a bus, we check if we need to update the places taken / left in the bus
    if (oldBusId) {
      const bus = await LigneBusModel.findById(oldBusId);
      if (bus) await updateSeatsTakenInBusLine(bus);
    }

    const referents = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department: young.department, status: ReferentStatus.ACTIVE });
    for (let referent of referents) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_CHANGE_COHORT, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          motif: WITHRAWN_REASONS.find((r) => r.value === cohortChangeReason)?.label || "",
          oldCohort,
          cohort: cohortObj.name,
          youngFirstName: young?.firstName,
          youngLastName: young?.lastName,
          message: cohortDetailedChangeReason,
        },
      });
    }
    const emailsTo: { name: string; email: string }[] = [];
    if (young.parent1AllowSNU === "true") emailsTo.push({ name: `${young.parent1FirstName} ${young.parent1LastName}`, email: young.parent1Email! });
    if (young?.parent2AllowSNU === "true") emailsTo.push({ name: `${young.parent2FirstName} ${young.parent2LastName}`, email: young.parent2Email! });
    if (emailsTo.length !== 0) {
      await sendTemplate(SENDINBLUE_TEMPLATES.parent.PARENT_YOUNG_COHORT_CHANGE, {
        emailTo: emailsTo,
        params: {
          cohort: cohortObj.name,
          youngFirstName: young.firstName,
          youngName: young.lastName,
          cta: `${config.APP_URL}/change-cohort`,
        },
      });
    }

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.young.CHANGE_COHORT, {
      young,
      previousYoung,
      cohortName: cohortObj.name,
      cohortChangeReason,
      message: value.message,
    });

    // Jamais le document brut : il porte les jetons du compte (audit 2026-09-21, L24).
    res.status(200).send({ ok: true, data: serializeYoung(young, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get(
  "/:id/application",
  authMiddleware(["referent", "young"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value: id } = Joi.string().required().validate(req.params.id, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      if (isYoung(req.user) && req.user._id.toString() !== id) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const young = await YoungModel.findById(id);
      if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

      if (isReferent(req.user) && !isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.APPLICATION, context: { young: young.toJSON() } })) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      // `CANDIDATURE_READ` est seedée sans policy : `isReadAuthorized` répond vrai pour tout volontaire.
      // Même périmètre que le dossier (`GET /referent/young/:id`), puis seules les candidatures de sa
      // structure / son réseau pour un responsable ou un superviseur (GOO-41).
      if (isReferent(req.user) && !(await canViewYoungFileInScope(req.user, young))) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const { error: queryError, value: isMilitaryPreparation } = Joi.boolean().validate(req.query.isMilitaryPreparation);
      if (queryError) {
        capture(queryError);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const query: any = { youngId: id, ...(isReferent(req.user) ? await getApplicationScopeFilter(req.user) : {}) };

      type PopulatedApplication = ApplicationDocument & { mission: MissionType; tutor: ReferentType; contract: ContractType };
      let data: PopulatedApplication[] = await ApplicationModel.find(query).populate("mission").populate("contract").populate("tutor");

      if (isMilitaryPreparation) {
        data = data.filter((a) => a.mission?.isMilitaryPreparation);
      }

      // La sérialisation doit produire un nouveau tableau : réassigner la variable de boucle ne modifiait
      // rien et laissait sortir le tuteur (référent) et le contrat en documents bruts, tokens compris.
      const serialized = data.map((application) => {
        if (application.mission?.tutorId && !application.tutorId) application.tutorId = application.mission.tutorId;
        if (application.mission?.structureId && !application.structureId) application.structureId = application.mission.structureId;
        // `contractId` et `tutorId` ont longtemps été écrits par le client : une candidature pouvait
        // pointer le contrat d'un autre volontaire ou n'importe quel référent (PH19). On ne joint que le
        // contrat de ce volontaire, et un tuteur de la structure réduit à son identité et ses coordonnées.
        const contract = application.contract && String(application.contract.youngId) === String(young._id) ? application.contract : null;
        const tutor = application.tutor && String(application.tutor.structureId) === String(application.structureId) ? application.tutor : null;
        return {
          ...serializeApplication(application),
          mission: application.mission ? serializeMission(application.mission as any) : application.mission,
          tutor: tutor ? { _id: tutor._id, firstName: tutor.firstName, lastName: tutor.lastName, email: tutor.email, phone: tutor.phone, mobile: tutor.mobile } : null,
          contract: contract ? serializeContract(contract as any) : null,
        };
      });

      return res.status(200).send({ ok: true, data: serialized });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// Delete one user (only admin can delete user)
router.put("/:id/soft-delete", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // Un compte déjà supprimé ne peut pas l'être de nouveau.
    if (young.status === YOUNG_STATUS.DELETED) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    if (!canDeleteYoung(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // « On ne garde rien » : seul le plancher (email requis/unique + bookkeeping).
    // Tout le reste est effacé par la boucle ci-dessous. Aligné sur anonymizeOldCohorts.effect.
    const fieldToKeep = ["_id", "__v", "createdAt"];

    // Fichiers S3 d'abord : si la purge échoue, rien n'est effacé en base et la suppression peut être
    // relancée. Effacer le document avant laisserait des binaires sans plus aucune référence (M48).
    let deletedFiles: number;
    try {
      deletedFiles = await purgeYoungFiles(id);
    } catch (e) {
      capture(e);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
    logger.info(`Soft-delete du volontaire ${id} : ${deletedFiles} fichier(s) S3 supprimé(s)`);

    // Brevo AVANT le wipe : la boucle ci-dessous efface les emails, donc unsync
    // doit lire les vrais emails maintenant (sinon il ne supprime aucun contact).
    // Garde-fou « email partagé » : on ne désinscrit que les emails qui n'appartiennent
    // à aucun AUTRE dossier actif (fratrie) ni à un référent — sinon le parent d'un
    // enfant actif perdrait les communications le concernant. cf. services/rgpdEmailGuard.
    await unsync(await keepOnlyUnsharedEmails(young));

    for (const key in young._doc) {
      if (!fieldToKeep.find((val) => val === key)) {
        young.set({ [key]: undefined });
      }
    }

    young.set({ email: `anonymized-${young._doc!["_id"]}@deleted.snu` });
    young.set({ cohort: "-" }); // marqueur « anonymisé » (la vraie cohorte n'est pas conservée)
    young.set({ status: YOUNG_STATUS.DELETED });
    young.set({ anonymized: true });
    young.set({ lastStatusAt: Date.now() });

    await young.save({ fromUser: req.user });

    // password est select:false (jamais chargé) et un hook bcrypt se déclenche si on le
    // modifie via .save() : on le retire donc par une écriture brute, hors hook.
    await YoungModel.collection.updateOne({ _id: young._id }, { $unset: { password: "" } });

    if (!canDeletePatchesHistory(req.user, young)) return res.status(403).json({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    // Patches : suppression TOTALE, alignée sur anonymizeOldCohorts.effect. deletePatches
    // CONSERVERAIT les ops birthdateAt/gender/zip/city/handicap/pps/pai… (son fieldToKeep
    // interne) — or le save() du wipe ci-dessus vient justement de créer un patch portant
    // ces valeurs réelles en originalValue : « on ne garde rien » serait faux en base.
    await (young as any).patches.collection.deleteMany({ ref: young._id });

    await anonymizeApplicationsFromYoungId({ youngId: young._id, anonymizedYoung: young });
    await anonymizeContractsFromYoungId({ youngId: young._id, anonymizedYoung: young });

    // Équivalences de mission : rompre le lien youngId + supprimer les patches (qui retiennent l'ancien youngId).
    const equivalences = await MissionEquivalenceModel.find({ youngId: young._id.toString() });
    for (const equivalence of equivalences) {
      equivalence.set({ youngId: undefined });
      await equivalence.save();
      // Suppression totale (même raison que pour le jeune : deletePatches retiendrait
      // des ops — dont celles du save() ci-dessus, ancien youngId en originalValue).
      await (equivalence as any).patches.collection.deleteMany({ ref: equivalence._id });
    }

    logger.debug(`Young ${id} has been soft deleted`);
    res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/withdraw", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: validationError, value } = Joi.object({ withdrawnMessage: Joi.string().required(), withdrawnReason: Joi.string().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (validationError) {
      capture(validationError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!youngCanWithdraw(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const cohort = await CohortModel.findOne({ name: young.cohort });
    if (!cohort) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
    const inscriptionStatus = ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION] as string[]).includes(young.status!);

    if (mandatoryPhasesDone || inscriptionStatus) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { withdrawnMessage, withdrawnReason } = value;

    await handleNotifForYoungWithdrawn(young, cohort, withdrawnReason, withdrawnMessage, req.user);

    const { sessionPhase1Id, ligneId } = young;

    young.set({
      status: YOUNG_STATUS.WITHDRAWN,
      statusPhase1: young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED ? YOUNG_STATUS_PHASE1.WAITING_AFFECTATION : young.statusPhase1,
      lastStatusAt: Date.now(),
      withdrawnMessage,
      withdrawnReason,
      // reset des informations d'affectation
      cohesionCenterId: undefined,
      sessionPhase1Id: undefined,
      meetingPointId: undefined,
      ligneId: undefined,
      hasMeetingInformation: undefined,
      transportInfoGivenByLocal: undefined,
      deplacementPhase1Autonomous: undefined,
      cohesionStayPresence: undefined,
      presenceJDM: undefined,
      departInform: undefined,
      departSejourAt: undefined,
      departSejourMotif: undefined,
      departSejourMotifComment: undefined,
    });

    const updatedYoung = await young.save({ fromUser: req.user });
    if (sessionPhase1Id) {
      const sessionPhase1 = await SessionPhase1Model.findById(sessionPhase1Id);
      if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, req.user);
    }

    // if they had a bus, we check if we need to update the places taken / left in the bus
    if (ligneId) {
      const bus = await LigneBusModel.findById(ligneId);
      if (bus) await updateSeatsTakenInBusLine(bus);
    }

    res.status(200).send({ ok: true, data: serializeYoung(updatedYoung, updatedYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/abandon", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error: validationError, value } = Joi.object({ withdrawnMessage: Joi.string().required(), withdrawnReason: Joi.string().required() })
      .unknown()
      .validate(req.body, { stripUnknown: true });
    if (validationError) {
      capture(validationError);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (!youngCanWithdraw(young)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
    const inscriptionStatus = ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION] as string[]).includes(young.status);

    if (mandatoryPhasesDone || !inscriptionStatus) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const { withdrawnMessage, withdrawnReason } = value;

    young.set({
      status: YOUNG_STATUS.ABANDONED,
      lastStatusAt: Date.now(),
      withdrawnMessage,
      withdrawnReason,
    });

    const updatedYoung = await young.save({ fromUser: req.user });

    res.status(200).send({ ok: true, data: serializeYoung(updatedYoung, updatedYoung) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.string().required().email().validate(req.query.email, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canGetYoungByEmail(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await YoungModel.findOne({ email: value });
    if (!data) return res.status(200).send({ ok: true, data: null });
    // `canGetYoungByEmail` n'est qu'une matrice de rôles : sans périmètre, un référent départemental
    // lisait le dossier (et les tokens) de n'importe quel volontaire du pays.
    if (req.user.role !== ROLES.ADMIN && !isYoungInReferentGeography(req.user, data)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return res.status(200).send({ ok: true, data: serializeYoung(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/file/:youngId/:key/:fileName", passport.authenticate("young", { session: false, failWithError: true }), async (req: UserRequest, res) => {
  try {
    const { error, value } = Joi.object({
      youngId: Joi.string().required(),
      key: Joi.string().required(),
      fileName: Joi.string().required(),
    })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const { youngId, key, fileName } = value;

    const young = await YoungModel.findById(youngId);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (req.user._id.toString() !== young._id.toString()) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    // add UUID logic here
    const downloaded = await getFile(`app/young/${youngId}/${key}/${fileName}`);
    const decryptedBuffer = decrypt(downloaded.Body);

    let mimeFromFile: FileTypeResult["mime"] | null = null;
    try {
      mimeFromFile = await getMimeFromBuffer(decryptedBuffer);
    } catch (e) {
      capture(e);
    }

    return res.status(200).send({
      data: Buffer.from(decryptedBuffer, "base64"),
      mimeType: mimeFromFile ? mimeFromFile : mime.lookup(fileName),
      fileName: fileName,
      ok: true,
    });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function getStatusAfterChangementSejour(currentStatus: string, department: string, cohort: CohortType) {
  if ([YOUNG_STATUS.ABANDONED, YOUNG_STATUS.WITHDRAWN].includes(currentStatus as any)) {
    return YOUNG_STATUS.WAITING_VALIDATION;
  }
  if (currentStatus === YOUNG_STATUS.VALIDATED) {
    const completionObjectif = await getCompletionObjectifs(department, cohort);
    if (completionObjectif.isAtteint) return YOUNG_STATUS.WAITING_LIST;
    else return YOUNG_STATUS.VALIDATED;
  }
  return currentStatus;
}

// Tous les sous-routeurs /young/:id/* passent par le contrôle d'appartenance commun : un jeune n'accède
// qu'à son propre dossier, un référent à ceux de son périmètre réel (audit 2026-09-21, lot 3).
// Les préfixes statiques doivent être montés avant les routes paramétrées.
// Le tunnel d'inscription (`/inscription2023`) et de réinscription (`/reinscription`) est supprimé :
// les inscriptions sont fermées (lot H1 de l'audit du 21/09/2026, constats M51 à M58).
router.use("/account", require("./account").default);
router.use("/note/:youngId", youngPerimeterMiddleware({ paramName: "youngId" }), require("./note").default);
router.use("/:id/documents", youngPerimeterMiddleware({ referentAccess: canAccessYoungDocumentsInScope }), require("./documents"));
router.use("/:id/meeting-point", youngPerimeterMiddleware(), require("./meeting-point"));
router.use("/:id/session", youngPerimeterMiddleware(), require("./session"));
router.use("/:id/phase2", youngPerimeterMiddleware(), require("./phase2"));
router.use("/:id/point-de-rassemblement", youngPerimeterMiddleware(), require("./point-de-rassemblement"));

export default router;

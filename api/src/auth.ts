import jwt from "jsonwebtoken";
import crypto from "crypto";
import Joi from "joi";
import { getDb } from "./mongo";

import { capture, captureMessage } from "./sentry";
import { config } from "./config";
import { logger } from "./logger";
import { sendTemplate } from "./brevo";
import {
  JWT_SIGNIN_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC,
  JWT_SESSION_ABSOLUTE_MAX_AGE_MS,
  JWT_SIGNIN_VERSION,
  JWT_TRUST_TOKEN_VERSION,
  JWT_TRUST_TOKEN_TYPE,
  checkJwtTrustTokenVersion,
} from "./jwt-options";
import { COOKIE_SIGNIN_MAX_AGE_MS, COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS, COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS, setSessionCookie, clearSessionCookie } from "./cookie-options";
import { getToken } from "./passport";
import { validatePassword, ERRORS, isYoung, STEPS2023, isReferent, validateBirthDate, normalizeString } from "./utils";
import {
  SENDINBLUE_TEMPLATES,
  PHONE_ZONES_NAMES_ARR,
  isFeatureEnabled,
  FEATURES_NAME,
  YOUNG_SOURCE,
  YOUNG_SOURCE_LIST,
  departmentToAcademy,
  DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS,
  DURATION_BEFORE_EXPIRATION_2FA_ADMIN_MS,
  isAdminCle,
  isReferentClasse,
  YOUNG_STATUS,
  ROLE_JEUNE,
  ROLES,
  ReferentStatus,
  ERRORS as SNU_ERRORS,
} from "snu-lib";

import { serializeYoung, serializeReferent } from "./utils/serializer";
import { consumeLoginAttempt, resetLoginAttempts, consume2FAAttempt, consumeEmailValidationAttempt, isLoginLocked } from "./services/auth/attemptCounters";
import { validateFirstName } from "./utils/validator";
import { getFilteredSessions } from "./utils/cohort";

import { ClasseModel, EtablissementModel, CohortModel } from "./models";
import { getFeatureFlagsAvailable } from "./featureFlag/featureFlagService";
import { getAcl } from "./services/iam/Permission.service";

// Le trust token ("cet appareil a déjà passé le 2FA") est lié au compte qui l'a obtenu :
// sans cette liaison, le nom du cookie (`trust_token-<_id>`) est la seule chose qui porte
// l'identité, et il est choisi par le client — n'importe quel trust token valide (ou même
// un JWT de session, signé avec le même secret) rejouait alors le 2FA de n'importe qui.
function signTrustToken(user, maxAgeSec: number): string {
  return jwt.sign(
    {
      __v: JWT_TRUST_TOKEN_VERSION,
      type: JWT_TRUST_TOKEN_TYPE,
      _id: user._id.toString(),
      passwordChangedAt: user.passwordChangedAt ?? null,
    },
    config.JWT_SECRET,
    { expiresIn: maxAgeSec },
  );
}

function isTrustTokenValidForUser(trustToken: string, user): boolean {
  let jwtPayload;
  try {
    jwtPayload = jwt.verify(trustToken, config.JWT_SECRET);
  } catch (e) {
    return false;
  }

  const { error, value } = Joi.object({
    __v: Joi.string().required(),
    type: Joi.string().valid(JWT_TRUST_TOKEN_TYPE).required(),
    _id: Joi.string().required(),
    passwordChangedAt: Joi.date().allow(null).required(),
  }).validate(jwtPayload, { stripUnknown: true });

  if (error) return false;
  if (!checkJwtTrustTokenVersion(value)) return false;
  if (value._id !== user._id.toString()) return false;
  // Un changement de mot de passe révoque les appareils de confiance.
  if (user.passwordChangedAt?.getTime() !== value.passwordChangedAt?.getTime()) return false;

  return true;
}

class Auth {
  model: any;

  constructor(model) {
    this.model = model;
  }

  // Young signup (not refs)
  async signUp(req, res) {
    const isCLE = req.body.source === YOUNG_SOURCE.CLE;
    if (isCLE) {
      await this.signupCLE(req, res);
    } else {
      await this.signupVolontaire(req, res);
    }
  }

  async countDocumentsInView(normalizedFirstName, normalizedLastName, birthdateAt) {
    const countResult = await getDb()
      .collection("normalizeName")
      .aggregate([
        {
          $match: {
            normalizedFirstName: normalizedFirstName,
            normalizedLastName: normalizedLastName,
            birthdateAt: birthdateAt,
          },
        },
        {
          $count: "count",
        },
      ])
      .toArray();
    return countResult.length > 0 ? countResult[0].count : 0;
  }

  async signupVolontaire(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        phone: Joi.string().trim().required(),
        phoneZone: Joi.string()
          .trim()
          .valid(...PHONE_ZONES_NAMES_ARR)
          .required(),
        firstName: validateFirstName().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
        birthdateAt: Joi.date().required(),
        frenchNationality: Joi.string().trim().required(),
        schooled: Joi.string().trim().required(),
        grade: Joi.string().trim().valid("NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "1ereCAP", "2ndeCAP", "Autre"),
        schoolName: Joi.string().trim(),
        schoolType: Joi.string().trim(),
        schoolAddress: Joi.string().trim(),
        schoolZip: Joi.string().trim().allow(null, ""),
        schoolCity: Joi.string().trim(),
        schoolDepartment: Joi.string().trim(),
        schoolRegion: Joi.string().trim(),
        schoolCountry: Joi.string().trim(),
        schoolId: Joi.string().trim(),
        zip: Joi.string().trim(),
        cohort: Joi.string().trim().required(),
      }).validate(req.body);

      if (error) {
        if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
        if (error.details[0].path.find((e) => e === "password")) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const {
        email,
        phone,
        phoneZone,
        firstName,
        lastName,
        password,
        birthdateAt,
        frenchNationality,
        schooled,
        schoolName,
        schoolType,
        schoolAddress,
        schoolZip,
        schoolCity,
        schoolDepartment,
        schoolRegion,
        schoolCountry,
        schoolId,
        zip,
        cohort,
        grade,
      } = value;
      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

      const formatedDate = new Date(birthdateAt);
      formatedDate.setUTCHours(11, 0, 0);

      if (!validateBirthDate(formatedDate)) return res.status(400).send({ ok: false, user: null, code: ERRORS.INVALID_PARAMS });
      const normalizedFirstName = normalizeString(firstName);
      const normalizedLastName = normalizeString(lastName);

      const count = await this.countDocumentsInView(normalizedFirstName, normalizedLastName, formatedDate);
      if (count > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      let sessions = await getFilteredSessions(value, req.headers["x-user-timezone"] || null);
      if (config.ENVIRONMENT !== "production") sessions.push({ name: "à venir" } as any);
      const session = sessions.find(({ name }) => name === value.cohort);
      if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      const tokenEmailValidation = await crypto.randomInt(1000000);

      const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, config.ENVIRONMENT);

      const cohortModel = await CohortModel.findOne({ name: cohort });

      const user = new this.model({
        email,
        phone,
        phoneZone,
        firstName,
        lastName,
        password,
        birthdateAt: formatedDate,
        frenchNationality,
        schooled,
        schoolName,
        schoolType,
        schoolAddress,
        schoolZip,
        schoolCity,
        schoolDepartment,
        schoolRegion,
        schoolCountry,
        schoolId,
        zip,
        cohort,
        cohortId: cohortModel?._id,
        grade,
        inscriptionStep2023: isEmailValidationEnabled ? STEPS2023.EMAIL_WAITING_VALIDATION : STEPS2023.COORDONNEES,
        emailVerified: "false",
        tokenEmailValidation,
        attemptsEmailValidation: 0,
        tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60,
      });

      await user.save({
        fromUser: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
      if (isEmailValidationEnabled) {
        await sendTemplate(SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
          params: {
            registration_code: tokenEmailValidation,
            cta: `${config.APP_URL}/preinscription/email-validation?token=${tokenEmailValidation}`,
          },
        });
      } else {
        await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email }],
          params: {
            firstName: user.firstName,
            lastName: user.lastName,
            cta: `${config.APP_URL}/inscription2023?utm_campaign=transactionnel+compte+créé&utm_source=notifauto&utm_medium=mail+219+accéder`,
          },
        });
      }

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: null, passwordChangedAt: null, emailVerified: "false" }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);

      return res.status(200).send({
        ok: true,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signupCLE(req, res) {
    try {
      let schema = {
        email: Joi.string().lowercase().trim().email().required(),
        phone: Joi.string().trim().required(),
        phoneZone: Joi.string()
          .trim()
          .valid(...PHONE_ZONES_NAMES_ARR)
          .required(),
        firstName: validateFirstName().trim().required(),
        lastName: Joi.string().uppercase().trim().required(),
        password: Joi.string().required(),
        birthdateAt: Joi.date().required(),
        grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "1ereCAP", "2ndeCAP"),
        frenchNationality: Joi.string().trim().required(),
        source: Joi.string()
          .trim()
          .valid(...YOUNG_SOURCE_LIST)
          .allow(null, ""),
        classeId: Joi.string().trim().required(),
      };

      const { error, value } = Joi.object(schema).validate(req.body);

      if (error) {
        if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
        if (error.details[0].path.find((e) => e === "password")) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { email, phone, phoneZone, firstName, lastName, password, grade, birthdateAt, frenchNationality, classeId } = value;

      if (!validatePassword(password)) return res.status(400).send({ ok: false, user: null, code: ERRORS.PASSWORD_NOT_VALIDATED });

      const formatedDate = new Date(birthdateAt);
      formatedDate.setUTCHours(11, 0, 0);
      const normalizedFirstName = normalizeString(firstName);
      const normalizedLastName = normalizeString(lastName);

      const count = await this.countDocumentsInView(normalizedFirstName, normalizedLastName, formatedDate);
      if (count > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      const classe = await ClasseModel.findOne({ _id: classeId });
      if (!classe) {
        return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const countOfUsersInClass = await this.model.countDocuments({
        classeId,
        deletedAt: { $exists: false },
        status: YOUNG_STATUS.VALIDATED,
      });
      logger.info(`Auth / signup - youngs : ${countOfUsersInClass} in class ${classeId}`);
      if (countOfUsersInClass >= classe.totalSeats) {
        return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) {
        return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const tokenEmailValidation = await crypto.randomInt(1000000);

      const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, config.ENVIRONMENT);

      const cohort = await CohortModel.findById(classe.cohortId);

      const userData = {
        email,
        phone,
        phoneZone,
        firstName,
        lastName,
        password,
        grade,
        birthdateAt: formatedDate,
        frenchNationality,
        inscriptionStep2023: isEmailValidationEnabled ? STEPS2023.EMAIL_WAITING_VALIDATION : STEPS2023.COORDONNEES,
        emailVerified: "false",
        tokenEmailValidation,
        attemptsEmailValidation: 0,
        tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60,
        source: YOUNG_SOURCE.CLE,
        schooled: "true",
        schoolName: etablissement.name,
        schoolType: etablissement.type[0],
        schoolAddress: etablissement.address,
        schoolZip: etablissement.zip,
        schoolCity: etablissement.city,
        schoolDepartment: etablissement.department,
        schoolRegion: etablissement.region,
        schoolCountry: etablissement.country,
        schoolId: etablissement.schoolId,
        zip: etablissement.zip,
        academy: departmentToAcademy[etablissement.department],
        classeId: classe._id,
        etablissementId: etablissement._id,
        cohort: classe.cohort,
        cohesionCenterId: classe.cohesionCenterId,
        sessionPhase1Id: classe.sessionId,
        meetingPointId: classe.pointDeRassemblementId,
        cohortId: cohort?._id,
      };

      const user = new this.model(userData);
      await user.save({
        fromUser: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
      if (!user) {
        throw new Error("Error while creating user");
      }

      if (isEmailValidationEnabled) {
        await sendTemplate(SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
          params: {
            registration_code: tokenEmailValidation,
            cta: `${config.APP_URL}/preinscription/email-validation?token=${tokenEmailValidation}`,
          },
        });
      } else {
        await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email }],
          params: {
            firstName: user.firstName,
            lastName: user.lastName,
            cta: `${config.APP_URL}/inscription2023?utm_campaign=transactionnel+compte+créé&utm_source=notifauto&utm_medium=mail+219+accéder`,
          },
        });
      }

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: null, passwordChangedAt: null, emailVerified: "false" }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);
      return res.status(200).send({
        ok: true,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signin(req, res) {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), password: Joi.string().required() }).unknown().validate(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.EMAIL_AND_PASSWORD_REQUIRED });

    const { password, email } = value;
    try {
      const now = new Date();
      const user = await this.model.findOne({ email, deletedAt: { $exists: false } });
      if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
      // Pré-filtrage : un compte déjà verrouillé est refusé sans consommer de
      // tentative, pour qu'un attaquant qui persiste ne repousse pas lui-même
      // indéfiniment la date de déblocage du compte visé.
      if (isLoginLocked(user, now)) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: user.nextLoginAttemptIn } });

      // La tentative est consommée AVANT bcrypt : sinon N requêtes concurrentes
      // franchissent toutes le contrôle de plafond pendant le hachage (M4).
      const attempt = await consumeLoginAttempt(this.model, user._id, now);
      if (attempt.blocked) {
        return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: attempt.nextLoginAttemptIn } });
      }

      const match = await user.comparePassword(password);

      if (!match) {
        if (attempt.delayed) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: attempt.nextLoginAttemptIn } });
        return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
      }

      // Mot de passe bon : le compteur est purgé tout de suite, y compris quand
      // le parcours se poursuit en 2FA, pour qu'un utilisateur qui relance
      // plusieurs fois sa connexion ne se verrouille pas lui-même.
      await resetLoginAttempts(this.model, user._id);
      user.set({ loginAttempts: 0, nextLoginAttemptIn: null });

      if (user?.status === ReferentStatus.INACTIVE) {
        return res.status(401).send({ ok: false, code: SNU_ERRORS.REFERENT_INACTIVE });
      }

      if (user.invitationToken && (isAdminCle(user) || isReferentClasse(user))) {
        return res.status(200).send({
          ok: true,
          code: "VERIFICATION_REQUIRED",
          redirect: `/verifier-mon-compte?token=${user.invitationToken}`,
        });
      }

      const shouldUse2FA = async () => {
        try {
          if (!config.ENABLE_2FA) return false;

          const trustToken = req.cookies[`trust_token-${user._id}`];
          if (!trustToken) return true;

          return !isTrustTokenValidForUser(trustToken, user);
        } catch (e) {
          capture(e);
          return true; // Handle JWT verification errors or other exceptions
        }
      };

      if (await shouldUse2FA()) {
        const token2FA = await crypto.randomInt(1000000);
        if (config.ENVIRONMENT === "development") {
          logger.debug(`2FA code : ${token2FA}`);
        }

        if (isYoung(user)) user.set({ token2FA, attempts2FA: 0, token2FAExpires: Date.now() + DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS });
        else if (isReferent(user)) user.set({ token2FA, attempts2FA: 0, token2FAExpires: Date.now() + DURATION_BEFORE_EXPIRATION_2FA_ADMIN_MS });
        await user.save();

        await sendTemplate(SENDINBLUE_TEMPLATES.SIGNIN_2FA, {
          emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
          params: {
            token2FA,
            duration: isYoung(user) ? `${DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS / 60 / 1000} minutes` : `${DURATION_BEFORE_EXPIRATION_2FA_ADMIN_MS / 60 / 1000} minutes`,
            cta: isYoung(user) ? `${config.APP_URL}/auth/2fa?email=${encodeURIComponent(user.email)}` : `${config.ADMIN_URL}/auth/2fa?email=${encodeURIComponent(user.email)}`,
          },
        });

        return res.status(200).send({
          ok: true,
          code: "2FA_REQUIRED",
        });
      }

      user.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
      await user.save();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);
      else if (isReferent(user)) setSessionCookie(res, "jwt_ref", token, COOKIE_SIGNIN_MAX_AGE_MS);

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);
      data.featureFlags = await getFeatureFlagsAvailable();
      if (isYoung(user)) {
        data.acl = await getAcl({ ...user, roles: [ROLE_JEUNE] });
      } else if (isReferent(user)) {
        data.acl = await getAcl(user);
      }

      return res.status(200).send({
        ok: true,
        user: data,
        data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signin2FA(req, res) {
    try {
      const { error, value } = Joi.object({
        email: Joi.string().lowercase().trim().email().required(),
        token_2fa: Joi.string().required(),
        rememberMe: Joi.boolean().required(),
      })
        .unknown()
        .validate(req.body);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      const { email, token_2fa, rememberMe } = value;
      // L'essai est consommé dans la même opération que le contrôle de plafond :
      // au-delà de 3, plus aucune requête ne matche, même en concurrence (M5).
      const user = await consume2FAAttempt(this.model, email);

      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (user.status === "DELETED" || (user as any).anonymized) return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
      if (user.token2FA !== token_2fa) {
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      user.set({ token2FA: null, token2FAExpires: null });
      user.set({ loginAttempts: 0, attempts2FA: 0 });
      user.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
      if (!user.emailVerified || user.emailVerified === "false") {
        user.set({ emailVerified: "true" });
        if (user.inscriptionStep2023 === STEPS2023.EMAIL_WAITING_VALIDATION) {
          user.set({ inscriptionStep2023: STEPS2023.COORDONNEES });
        }
      }
      await user.save();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) {
        if (rememberMe) {
          const trustToken = signTrustToken(user, JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC);
          setSessionCookie(res, `trust_token-${user._id}`, trustToken, COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS);
        }
        setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);
      } else if (isReferent(user)) {
        if (rememberMe) {
          const trustToken = signTrustToken(user, JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC);
          setSessionCookie(res, `trust_token-${user._id}`, trustToken, COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS);
        }
        setSessionCookie(res, "jwt_ref", token, COOKIE_SIGNIN_MAX_AGE_MS);
      }

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);
      data.featureFlags = await getFeatureFlagsAvailable();
      return res.status(200).send({
        ok: true,
        user: data,
        data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async changeEmailDuringSignUp(req, res) {
    try {
      const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).validate(req.body, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const user = await this.model.findOne({
        email: req.user.email,
        emailVerified: "false",
      });

      if (!user) return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });

      const existingUser = await this.model.findOne({
        email: value.email,
      });

      if (existingUser) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

      const tokenEmailValidation = await crypto.randomInt(1000000);
      user.set({ email: value.email, tokenEmailValidation, attemptsEmailValidation: 0, tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60 });
      await user.save();

      await sendTemplate(SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: value.email }],
        params: {
          registration_code: tokenEmailValidation,
          cta: `${config.APP_URL}/preinscription/email-validation?token=${tokenEmailValidation}`,
        },
      });

      return res.status(200).send({
        ok: true,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async requestEmailUpdate(req, res) {
    try {
      const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required(), password: Joi.string().required() }).unknown().validate(req.body);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const { password, email } = value;

      if (req.user.email === email) return res.status(400).send({ ok: false, code: ERRORS.EMAIL_UNCHANGED });

      // Le mot de passe est vérifié AVANT toute recherche sur l'email visé :
      // sinon la route sert d'oracle d'existence de compte à tout jeune
      // authentifié, sans qu'il ait à connaître son propre mot de passe (M6).
      const match = await req.user.comparePassword(password);
      if (!match) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_INVALID });

      // is new email already used?
      const existingUser = await this.model.findOne({
        email,
      });
      if (existingUser) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

      const currentUser = await this.model.findOne({
        email: req.user.email,
      });

      if (!currentUser) return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      const tokenEmailValidation = await crypto.randomInt(1000000);
      currentUser.set({ newEmail: value.email, tokenEmailValidation, attemptsEmailValidation: 0, tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60 });

      await currentUser.save();

      await sendTemplate(SENDINBLUE_TEMPLATES.PROFILE_EMAIL_VALIDATION, {
        emailTo: [{ name: `${currentUser.firstName} ${currentUser.lastName}`, email: value.email }],
        params: {
          registration_code: tokenEmailValidation,
          cta: `${config.APP_URL}/account/general?newEmailValidationToken=${tokenEmailValidation}`,
        },
      });

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async validateEmailUpdate(req, res) {
    try {
      const { error, value } = Joi.object({ token_email_validation: Joi.string().required() }).unknown().validate(req.body);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      const { token_email_validation } = value;
      const user = await consumeEmailValidationAttempt(this.model, { email: req.user.email });

      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (!user.newEmail) return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      if (user.tokenEmailValidation !== token_email_validation) {
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      const existingUser = await this.model.findOne({
        email: user.newEmail,
      });

      if (existingUser) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

      user.set({ tokenEmailValidation: null, tokenEmailValidationExpires: null, attemptsEmailValidation: 0, email: user.newEmail, newEmail: null });
      await user.save();

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);
      data.featureFlags = await getFeatureFlagsAvailable();

      return res.status(200).send({
        ok: true,
        user: data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async validateEmail(req, res) {
    try {
      const { error, value } = Joi.object({ token_email_validation: Joi.string().required() }).unknown().validate(req.body);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      const { token_email_validation } = value;
      const user = await consumeEmailValidationAttempt(this.model, { email: req.user.email, emailVerified: "false" });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (user.tokenEmailValidation !== token_email_validation) {
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      user.set({ tokenEmailValidation: null, tokenEmailValidationExpires: null, attemptsEmailValidation: 0, emailVerified: "true" });
      if (user.inscriptionStep2023 === STEPS2023.EMAIL_WAITING_VALIDATION) {
        user.set({ inscriptionStep2023: STEPS2023.COORDONNEES });
      }
      await user.save();

      // Plus d'e-mail « inscription commencée » : il renvoyait vers le tunnel d'inscription, supprimé (lot H1).

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) {
        const trustToken = signTrustToken(user, JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC);
        setSessionCookie(res, `trust_token-${user._id}`, trustToken, COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS);
        setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);
      } else if (isReferent(user)) {
        const trustToken = signTrustToken(user, JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC);
        setSessionCookie(res, `trust_token-${user._id}`, trustToken, COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS);
        setSessionCookie(res, "jwt_ref", token, COOKIE_SIGNIN_MAX_AGE_MS);
      }

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);
      data.featureFlags = await getFeatureFlagsAvailable();
      return res.status(200).send({
        ok: true,
        user: data,
        data,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async requestNewEmailValidationToken(req, res) {
    try {
      const user = await this.model.findOne({
        email: req.user.email,
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });

      if (!(user.emailVerified === "false" || user.newEmail)) {
        return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      }

      const tokenEmailValidation = await crypto.randomInt(1000000);

      user.set({ tokenEmailValidation, attemptsEmailValidation: 0, tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60 });
      await user.save();

      await sendTemplate(user.newEmail ? SENDINBLUE_TEMPLATES.PROFILE_EMAIL_VALIDATION : SENDINBLUE_TEMPLATES.SIGNUP_EMAIL_VALIDATION, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: req.user.email }],
        params: {
          registration_code: tokenEmailValidation,
          cta: user.newEmail
            ? `${config.APP_URL}/account/general?newEmailValidationToken=${tokenEmailValidation}`
            : `${config.APP_URL}/preinscription/email-validation?token=${tokenEmailValidation}`,
        },
      });

      return res.status(200).send({
        ok: true,
      });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async logout(req, res) {
    try {
      // Find user by token
      const { user } = req;
      user.set({ lastLogoutAt: Date.now() });
      await user.save();
      if (isYoung(user)) clearSessionCookie(res, "jwt_young");
      else if (isReferent(user)) clearSessionCookie(res, "jwt_ref");

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async signinToken(req, res) {
    const { error, value } = Joi.object({ token_ref: Joi.string(), token_young: Joi.string() }).validate({ token_ref: req.cookies.jwt_ref, token_young: req.cookies.jwt_young });
    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });

    try {
      const { user } = req;
      user.set({ lastActivityAt: Date.now() });
      await user.save();
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);
      data.featureFlags = await getFeatureFlagsAvailable();
      const token = isYoung(user) ? value.token_young : value.token_ref;
      const jwtPayload = (await jwt.verify(token, config.JWT_SECRET)) as jwt.JwtPayload;
      if (jwtPayload._impersonateId) {
        data.impersonateId = jwtPayload._impersonateId;
      }
      if (!data || !token) {
        captureMessage("PB with signin_token", { extra: { data: data, token: token } });
        return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }
      if (user?.status === ReferentStatus.INACTIVE) {
        return res.status(401).send({ ok: false, code: SNU_ERRORS.REFERENT_INACTIVE });
      }
      if (isYoung(user)) {
        data.acl = await getAcl({ ...user, roles: [ROLE_JEUNE] });
      } else if (isReferent(user)) {
        data.acl = await getAcl(user);
      }
      res.send({ ok: true, user: data, data });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async refreshToken(req, res) {
    const { error, value } = Joi.object({ token_ref: Joi.string(), token_young: Joi.string() }).validate({ token_ref: req.cookies.jwt_ref, token_young: req.cookies.jwt_young });
    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    try {
      const { user } = req;
      if (user?.status === ReferentStatus.INACTIVE) {
        return res.status(401).send({ ok: false, code: SNU_ERRORS.REFERENT_INACTIVE });
      }
      // Durée absolue de session (GOO-16) : l'instant de connexion suit le jeton d'un renouvellement
      // à l'autre, et un jeton émis sans ce marqueur est daté par son `iat`. Passé le plafond, plus
      // de renouvellement : un jeton volé ne se prolonge plus indéfiniment.
      const currentPayload = jwt.decode(getToken(req) || "") as jwt.JwtPayload | null;
      const sessionStartedAt = typeof currentPayload?.sessionStartedAt === "number" ? currentPayload.sessionStartedAt : (currentPayload?.iat || 0) * 1000;
      if (!sessionStartedAt || Date.now() - sessionStartedAt > JWT_SESSION_ABSOLUTE_MAX_AGE_MS) {
        clearSessionCookie(res, "jwt_ref");
        return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      user.set({ lastActivityAt: Date.now() });
      await user.save();
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user);

      data.featureFlags = await getFeatureFlagsAvailable();
      data.impersonateId = req.user.impersonateId;

      const token = jwt.sign(
        {
          __v: JWT_SIGNIN_VERSION,
          _id: user.id,
          _impersonateId: req.user.impersonateId,
          lastLogoutAt: user.lastLogoutAt,
          passwordChangedAt: user.passwordChangedAt,
          sessionStartedAt,
        },
        config.JWT_SECRET,
        {
          expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
        },
      );

      if (!data || !token) {
        captureMessage("PB with signin_token", { extra: { data, token } });
        return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      setSessionCookie(res, "jwt_ref", token, COOKIE_SIGNIN_MAX_AGE_MS);
      res.send({ ok: true, user: data, data });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async checkPassword(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { password } = value;

    try {
      const now = new Date();
      const user = await this.model.findById(req.user._id);

      // Même défaut que signin : le compteur doit être consommé atomiquement,
      // et avant la comparaison bcrypt.
      if (isLoginLocked(user, now)) return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: user.nextLoginAttemptIn } });

      const attempt = await consumeLoginAttempt(this.model, user._id, now);
      if (attempt.blocked) {
        return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: attempt.nextLoginAttemptIn } });
      }

      const match = await req.user.comparePassword(password);
      if (!match) {
        if (attempt.delayed) return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: attempt.nextLoginAttemptIn } });
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_INVALID });
      }
      await resetLoginAttempts(this.model, user._id);

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async resetPassword(req, res) {
    const { error, value } = Joi.object({
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
      verifyPassword: Joi.string().required(),
    })
      .unknown()
      .validate(req.body);

    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const { password, verifyPassword, newPassword } = value;

    if (!validatePassword(newPassword)) {
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
    }

    try {
      const match = await req.user.comparePassword(password);
      if (!match) return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_INVALID });
      if (newPassword !== verifyPassword) return res.status(422).send({ ok: false, code: ERRORS.PASSWORDS_NOT_MATCH });
      if (newPassword === password) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });

      const user = await this.model.findById(req.user._id);
      const passwordChangedAt = Date.now();
      user.set({ password: newPassword, passwordChangedAt, loginAttempts: 0 });
      await user.save();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) {
        setSessionCookie(res, "jwt_young", token, COOKIE_SIGNIN_MAX_AGE_MS);
        user.acl = await getAcl({ ...user, roles: [ROLE_JEUNE] });
      } else if (isReferent(user)) {
        setSessionCookie(res, "jwt_ref", token, COOKIE_SIGNIN_MAX_AGE_MS);
        user.acl = await getAcl(user);
      }

      return res.status(200).send({ ok: true, user: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user) });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPassword(req, res, cta) {
    const { error, value } = Joi.object({ email: Joi.string().lowercase().trim().email().required() }).unknown().validate(req.body);
    if (error) return res.status(404).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    const { email } = value;

    try {
      const user = await this.model.findOne({ email, deletedAt: { $exists: false } });
      if (!user || user?.status === ReferentStatus.INACTIVE) return res.status(200).send({ ok: true });

      const token = await crypto.randomBytes(20).toString("hex");
      user.set({ forgotPasswordResetToken: token, forgotPasswordResetExpires: Date.now() + COOKIE_SIGNIN_MAX_AGE_MS });
      await user.save();

      await sendTemplate(SENDINBLUE_TEMPLATES.FORGOT_PASSWORD, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email }],
        params: { cta: `${cta}?token=${token}` },
      });

      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }

  async forgotPasswordReset(req, res) {
    const { error, value } = Joi.object({ password: Joi.string().required(), token: Joi.string().min(16).required() })
      .unknown()
      .validate(req.body);

    if (error) {
      if (error.details.find((e) => e.path === ("password" as any))) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
      return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
    }

    const { token, password } = value;
    if (!validatePassword(password)) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });

    try {
      const user = await this.model.findOne({
        forgotPasswordResetToken: token,
        forgotPasswordResetExpires: { $gt: Date.now() },
        deletedAt: { $exists: false },
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      const match = await user.comparePassword(password);
      if (match) return res.status(401).send({ ok: false, code: ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD });
      if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && !user.registredAt) {
        user.registredAt = Date.now();
      }

      user.password = password;
      user.forgotPasswordResetToken = "";
      user.forgotPasswordResetExpires = "";
      user.passwordChangedAt = Date.now();
      user.loginAttempts = 0;
      await user.save();
      return res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  }
}

export default Auth;

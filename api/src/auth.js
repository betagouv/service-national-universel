const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");

const { capture, captureMessage } = require("./sentry");
const config = require("config");
const { sendTemplate, regexp_exception_staging } = require("./brevo");
const {
  JWT_SIGNIN_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC,
  JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC,
  JWT_SIGNIN_VERSION,
  JWT_TRUST_TOKEN_VERSION,
  checkJwtTrustTokenVersion,
} = require("./jwt-options");
const { COOKIE_SIGNIN_MAX_AGE_MS, COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS, COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS, cookieOptions } = require("./cookie-options");
const { validatePassword, ERRORS, isYoung, STEPS2023, isReferent, validateBirthDate } = require("./utils");
const {
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
} = require("snu-lib");
const { serializeYoung, serializeReferent } = require("./utils/serializer");
const { validateFirstName } = require("./utils/validator");
const { getFilteredSessions } = require("./utils/cohort");
const { ClasseModel, EtablissementModel } = require("./models");
const { getFeatureFlagsAvailable } = require("./featureFlag/featureFlagService");

class Auth {
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

      const formatedDate = birthdateAt;
      formatedDate.setUTCHours(11, 0, 0);
      if (!validateBirthDate(formatedDate)) return res.status(400).send({ ok: false, user: null, code: ERRORS.INVALID_PARAMS });

      let countDocuments = await this.model.countDocuments({ lastName, firstName, birthdateAt: formatedDate });
      if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      let sessions = await getFilteredSessions(value, req.headers["x-user-timezone"] || null);
      if (config.ENVIRONMENT !== "production") sessions.push({ name: "à venir" });
      const session = sessions.find(({ name }) => name === value.cohort);
      if (!session) return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });

      const tokenEmailValidation = await crypto.randomInt(1000000);

      const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, config.ENVIRONMENT);

      const user = await this.model.create({
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
        grade,
        inscriptionStep2023: isEmailValidationEnabled ? STEPS2023.EMAIL_WAITING_VALIDATION : STEPS2023.COORDONNEES,
        emailVerified: "false",
        tokenEmailValidation,
        attemptsEmailValidation: 0,
        tokenEmailValidationExpires: Date.now() + 1000 * 60 * 60,
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
      res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

      return res.status(200).send({
        ok: true,
        token,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      console.log("Error ", error);
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
        grade: Joi.string().trim().valid("4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre", "1erCAP", "2ndeCAP"),
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

      const formatedDate = birthdateAt;
      formatedDate.setUTCHours(11, 0, 0);
      if (!validateBirthDate(formatedDate)) return res.status(400).send({ ok: false, user: null, code: ERRORS.INVALID_PARAMS });

      let countDocuments = await this.model.countDocuments({ lastName, firstName, birthdateAt: formatedDate });
      if (countDocuments > 0) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });

      const classe = await ClasseModel.findOne({ _id: classeId });
      if (!classe) {
        return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const countOfUsersInClass = await this.model.countDocuments({ classeId, deletedAt: { $exists: false } });
      if (countOfUsersInClass >= classe.totalSeats) {
        return res.status(409).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
      }

      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) {
        return res.status(400).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const tokenEmailValidation = await crypto.randomInt(1000000);

      const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, config.ENVIRONMENT);

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
        //TODO ajouter le grade de la classe selectionné par le jeune
        cohesionCenterId: classe.cohesionCenterId,
        sessionPhase1Id: classe.sessionId,
        meetingPointId: classe.pointDeRassemblementId,
      };

      const user = await this.model.create(userData);
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
      res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      return res.status(200).send({
        ok: true,
        token,
        user: serializeYoung(user, user),
      });
    } catch (error) {
      console.log("Error ", error);
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
      if (user.loginAttempts > 12) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS" });
      if (user.nextLoginAttemptIn > now) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: user.nextLoginAttemptIn } });

      const match = config.ENVIRONMENT === "development" || (await user.comparePassword(password));
      if (!match) {
        const loginAttempts = (user.loginAttempts || 0) + 1;

        let date = now;
        if (loginAttempts > 5) {
          date = new Date(now.getTime() + 60 * 1000);
        }

        user.set({ loginAttempts, nextLoginAttemptIn: date });
        await user.save();
        if (date > now) return res.status(401).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: date } });
        return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });
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
          if (config.ENVIRONMENT === "development") return false;
          if (["staging", "ci", "custom"].includes(config.ENVIRONMENT) && !user.email.match(regexp_exception_staging)) return false;

          const trustToken = req.cookies[`trust_token-${user._id}`];
          if (!trustToken) return true;

          let jwtPayload;
          try {
            jwtPayload = await jwt.verify(trustToken, config.JWT_SECRET);
          } catch (e) {
            return true;
          }
          const { error, value } = Joi.object({ __v: Joi.string().required() }).validate(jwtPayload, { stripUnknown: true });
          return error || !checkJwtTrustTokenVersion(value);
        } catch (e) {
          capture(e);
          return true; // Handle JWT verification errors or other exceptions
        }
      };

      if (await shouldUse2FA()) {
        const token2FA = await crypto.randomInt(1000000);
        if (config.ENVIRONMENT === "development") console.log(`2FA code : ${token2FA}`);

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

      user.set({ loginAttempts: 0 });
      user.set({ lastLoginAt: Date.now(), lastActivityAt: Date.now() });
      await user.save();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      data.featureFlags = await getFeatureFlagsAvailable();
      return res.status(200).send({
        ok: true,
        token,
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
      const user = await this.model.findOne({
        email,
        attempts2FA: { $lt: 3 },
        token2FAExpires: { $gt: Date.now() },
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (user.token2FA !== token_2fa) {
        user.set({ attempts2FA: (user.attempts2FA || 0) + 1 });
        await user.save();
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
          const trustToken = jwt.sign({ __v: JWT_TRUST_TOKEN_VERSION }, config.JWT_SECRET, { expiresIn: JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC });
          res.cookie(`trust_token-${user._id}`, trustToken, cookieOptions(COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS));
        }
        res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      } else if (isReferent(user)) {
        if (rememberMe) {
          const trustToken = jwt.sign({ __v: JWT_TRUST_TOKEN_VERSION }, config.JWT_SECRET, { expiresIn: JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC });
          res.cookie(`trust_token-${user._id}`, trustToken, cookieOptions(COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS));
        }
        res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      }

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      data.featureFlags = await getFeatureFlagsAvailable();
      return res.status(200).send({
        ok: true,
        token,
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

      // is new email already used?
      const existingUser = await this.model.findOne({
        email,
      });
      if (existingUser) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

      const match = await req.user.comparePassword(password);
      if (!match) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_INVALID });

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
      const user = await this.model.findOne({
        email: req.user.email,
        attemptsEmailValidation: { $lt: 3 },
        tokenEmailValidationExpires: { $gt: Date.now() },
      });

      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (!user.newEmail) return res.status(400).send({ ok: false, code: ERRORS.BAD_REQUEST });
      if (user.tokenEmailValidation !== token_email_validation) {
        user.set({ attemptsEmailValidation: (user.attemptsEmailValidation || 0) + 1 });
        await user.save();
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      const existingUser = await this.model.findOne({
        email: user.newEmail,
      });

      if (existingUser) return res.status(409).send({ ok: false, code: ERRORS.EMAIL_ALREADY_USED });

      user.set({ tokenEmailValidation: null, tokenEmailValidationExpires: null, attemptsEmailValidation: 0, email: user.newEmail, newEmail: null });
      await user.save();

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
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
      const user = await this.model.findOne({
        email: req.user.email,
        attemptsEmailValidation: { $lt: 3 },
        tokenEmailValidationExpires: { $gt: Date.now() },
        emailVerified: "false",
      });
      if (!user) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      if (user.tokenEmailValidation !== token_email_validation) {
        user.set({ attemptsEmailValidation: (user.attemptsEmailValidation || 0) + 1 });
        await user.save();
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      user.set({ tokenEmailValidation: null, tokenEmailValidationExpires: null, attemptsEmailValidation: 0, emailVerified: "true" });
      if (user.inscriptionStep2023 === STEPS2023.EMAIL_WAITING_VALIDATION) {
        user.set({ inscriptionStep2023: STEPS2023.COORDONNEES });
      }
      await user.save();

      await sendTemplate(SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED, {
        emailTo: [{ name: `${user.firstName} ${user.lastName}`, email: user.email }],
        params: {
          firstName: user.firstName,
          lastName: user.lastName,
          cta: `${config.APP_URL}/inscription2023?utm_campaign=transactionnel+compte+créé&utm_source=notifauto&utm_medium=mail+219+accéder`,
        },
      });

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });
      if (isYoung(user)) {
        const trustToken = jwt.sign({ __v: JWT_TRUST_TOKEN_VERSION }, config.JWT_SECRET, { expiresIn: JWT_TRUST_TOKEN_MONCOMPTE_MAX_AGE_SEC });
        res.cookie(`trust_token-${user._id}`, trustToken, cookieOptions(COOKIE_TRUST_TOKEN_MONCOMPTE_JWT_MAX_AGE_MS));
        res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      } else if (isReferent(user)) {
        const trustToken = jwt.sign({ __v: JWT_TRUST_TOKEN_VERSION }, config.JWT_SECRET, { expiresIn: JWT_TRUST_TOKEN_ADMIN_MAX_AGE_SEC });
        res.cookie(`trust_token-${user._id}`, trustToken, cookieOptions(COOKIE_TRUST_TOKEN_ADMIN_JWT_MAX_AGE_MS));
        res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      }

      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      data.featureFlags = await getFeatureFlagsAvailable();
      return res.status(200).send({
        ok: true,
        token,
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
      if (isYoung(user)) res.clearCookie("jwt_young", cookieOptions());
      else if (isReferent(user)) res.clearCookie("jwt_ref", cookieOptions());

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
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      data.featureFlags = await getFeatureFlagsAvailable();
      const token = isYoung(user) ? value.token_young : value.token_ref;
      if (!data || !token) {
        captureMessage("PB with signin_token", { extra: { data: data, token: token } });
        return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }
      res.send({ ok: true, token: token, user: data, data });
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
      user.set({ lastActivityAt: Date.now() });
      await user.save();
      const data = isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user);
      data.featureFlags = await getFeatureFlagsAvailable();

      const token = jwt.sign({ __v: JWT_SIGNIN_VERSION, _id: user.id, lastLogoutAt: user.lastLogoutAt, passwordChangedAt: user.passwordChangedAt }, config.JWT_SECRET, {
        expiresIn: JWT_SIGNIN_MAX_AGE_SEC,
      });

      if (!data || !token) {
        captureMessage("PB with signin_token", { extra: { data, token } });
        return res.status(401).send({ ok: false, code: ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID });
      }

      res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      res.send({ ok: true, token, user: data, data });
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

      if (user.loginAttempts > 12) return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS" });
      if (user.nextLoginAttemptIn > now) return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: user.nextLoginAttemptIn } });

      const match = await req.user.comparePassword(password);
      if (!match) {
        const loginAttempts = (user.loginAttempts || 0) + 1;

        let date = now;
        if (loginAttempts > 5) {
          date = new Date(now.getTime() + 60 * 1000);
        }

        user.set({ loginAttempts, nextLoginAttemptIn: date });
        await user.save();
        if (date > now) return res.status(400).send({ ok: false, code: "TOO_MANY_REQUESTS", data: { nextLoginAttemptIn: date } });
        return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_INVALID });
      }
      user.set({ loginAttempts: 0 });
      await user.save();

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
      if (isYoung(user)) res.cookie("jwt_young", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));
      else if (isReferent(user)) res.cookie("jwt_ref", token, cookieOptions(COOKIE_SIGNIN_MAX_AGE_MS));

      return res.status(200).send({ ok: true, user: isYoung(user) ? serializeYoung(user, user) : serializeReferent(user, user) });
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
      if (!user) return res.status(200).send({ ok: true });

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
      if (error.details.find((e) => e.path === "password")) return res.status(400).send({ ok: false, code: ERRORS.PASSWORD_NOT_VALIDATED });
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

module.exports = Auth;

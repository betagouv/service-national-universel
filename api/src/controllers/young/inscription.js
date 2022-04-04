const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { canUpdateYoungStatus, getAge } = require("snu-lib");
const { capture } = require("../../sentry");
const { validateFirstName } = require("../../utils/validator");
const { serializeYoung } = require("../../utils/serializer");

const { ERRORS, YOUNG_SITUATIONS, STEPS, inscriptionCheck, YOUNG_STATUS } = require("../../utils");
const { getCohortSessionsAvailability } = require("../../utils/cohort");

router.put("/profile", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    //TODO : Check adress + date
    const { error, value } = Joi.object({
      email: Joi.string().lowercase().trim().email().required(),
      firstName: validateFirstName().trim().required(),
      lastName: Joi.string().uppercase().trim().required(),
      birthdateAt: Joi.string().trim().required(),
      birthCountry: Joi.string().trim().required(),
      birthCity: Joi.string().trim().required(),
      birthCityZip: Joi.string().trim().allow(null, ""),
    }).validate(req.body);

    if (error) {
      if (error.details[0].path.find((e) => e === "email")) return res.status(400).send({ ok: false, user: null, code: ERRORS.EMAIL_INVALID });
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip } = value;
    young.set({ email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip });
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    if (error.code === 11000) return res.status(409).send({ ok: false, code: ERRORS.USER_ALREADY_REGISTERED });
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/coordonnee", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    //TODO : Check adress + date
    const { error, value } = Joi.object({
      gender: Joi.string().trim().required().valid("female", "male"),
      phone: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      address: Joi.string().trim().required(),
      location: Joi.object()
        .keys({
          lat: Joi.number().required(),
          lon: Joi.number().required(),
        })
        .default({
          lat: null,
          lon: null,
        })
        .allow({}, null),
      department: Joi.string().trim().required(),
      region: Joi.string().trim().required(),
      cityCode: Joi.string().trim().default("").allow("", null),
      academy: Joi.string().trim().required(),
      addressVerified: Joi.string().trim().required().valid("true"),
      schooled: Joi.string().trim().required().valid("true", "false"),
      livesInFrance: Joi.string().trim().required().valid("true", "false"),

      //Foreign adress -> if livesInFrance = false then required else Error
      hostLastName: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: Joi.string().trim().required(),
        otherwise: Joi.isError(new Error()),
      }),
      hostFirstName: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      hostRelationship: Joi.alternatives().conditional("livesInFrance", {
        is: "false",
        then: Joi.string().trim().required().valid("Parent", "Frere/Soeur", "Grand-parent", "Oncle/Tante", "Ami de la famille", "Autre"),
        otherwise: Joi.isError(new Error()),
      }),
      foreignCountry: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignCity: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignZip: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      foreignAddress: Joi.alternatives().conditional("livesInFrance", { is: "false", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),

      //student -> if schooled then required else error
      // ! Particular case :
      // If schoolCountry != France then {schoolCity, schoolId, schoolDepartment} not required
      schoolCountry: Joi.alternatives().conditional("schooled", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      schoolName: Joi.alternatives().conditional("schooled", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),

      schoolCity: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.alternatives().conditional("schoolCountry", { is: "France", then: Joi.string().trim().required(), otherwise: Joi.string().default("").allow("", null) }),
        otherwise: Joi.isError(new Error()),
      }),
      schoolId: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.alternatives().conditional("schoolCountry", {
          is: "France",
          then: Joi.string().trim().required().allow("", null),
          otherwise: Joi.string().default("").allow("", null),
        }),
        otherwise: Joi.isError(new Error()),
      }),
      schoolDepartment: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.alternatives().conditional("schoolCountry", { is: "France", then: Joi.string().trim().required(), otherwise: Joi.string().default("").allow("", null) }),
        otherwise: Joi.isError(new Error()),
      }),
      grade: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.string().trim().required().valid("3eme", "2nd", "1ere", "1ere CAP", "Terminale", "Terminale CAP", "SEGPA", "Classe relais", "Autre"),
        otherwise: Joi.isError(new Error()),
      }),

      employed: Joi.alternatives().conditional("schooled", { is: "false", then: Joi.string().trim().required().valid("true", "false"), otherwise: Joi.string().default("false") }),

      //Field validation for situation depending on schooled and employed
      situation: Joi.alternatives().conditional("schooled", {
        is: "true",
        then: Joi.string()
          .trim()
          .required()
          .valid(
            YOUNG_SITUATIONS.GENERAL_SCHOOL,
            YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
            YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
            YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
            YOUNG_SITUATIONS.APPRENTICESHIP,
          ),
        otherwise: Joi.alternatives().conditional("employed", {
          is: "true",
          then: Joi.string().trim().required().valid(YOUNG_SITUATIONS.EMPLOYEE, YOUNG_SITUATIONS.INDEPENDANT, YOUNG_SITUATIONS.SELF_EMPLOYED, YOUNG_SITUATIONS.ADAPTED_COMPANY),
          otherwise: Joi.string().trim().required().valid(YOUNG_SITUATIONS.POLE_EMPLOI, YOUNG_SITUATIONS.MISSION_LOCALE, YOUNG_SITUATIONS.CAP_EMPLOI, YOUNG_SITUATIONS.NOTHING),
        }),
      }),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.livesInFrance === "true") {
      value.hostLastName = "";
      value.hostFirstName = "";
      value.hostRelationship = "";
      value.foreignCountry = "";
      value.foreignCity = "";
      value.foreignZip = "";
      value.foreignAddress = "";
    }

    if (value.schooled === "false") {
      value.schoolName = "";
      value.schoolId = "";
      value.schoolCountry = "";
      value.schoolCity = "";
      value.schoolDepartment = "";
      value.grade = "";
    }

    delete value.livesInFrance;
    value.inscriptionStep = STEPS.AVAILABILITY;

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });

    await inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/availability", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const sessions = await getCohortSessionsAvailability(young);

    const sessionsId = sessions.map((session) => {
      return session.id;
    });

    const { error, value } = Joi.object({
      cohort: Joi.string()
        .trim()
        .required()
        .valid(...sessionsId),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    young.set({ inscriptionStep: STEPS.PARTICULIERES, ...value });
    await young.save({ fromUser: req.user });
    await inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/availability/notEligible", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const sessions = await getCohortSessionsAvailability(young);

    if (sessions?.length === 0 && young.cohort === "2022") {
      young.set({ status: YOUNG_STATUS.NOT_ELIGIBLE });
    } else {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_NOT_ALLOWED });
    }

    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/availability/reset", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    young.set({ cohort: "2022" });
    await young.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/particulieres", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      handicap: Joi.string().trim().required().valid("true", "false"),
      ppsBeneficiary: Joi.string().trim().required().valid("true", "false"),
      paiBeneficiary: Joi.string().trim().required().valid("true", "false"),
      allergies: Joi.string().trim().required().valid("true", "false"),
      highSkilledActivity: Joi.string().trim().required().valid("true", "false"),
      moreInformation: Joi.string().trim().required().valid("true", "false"),

      specificAmenagment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
      reducedMobilityAccess: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
      handicapInSameDepartment: Joi.alternatives().conditional("moreInformation", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),

      highSkilledActivityInSameDepartment: Joi.alternatives().conditional("highSkilledActivity", {
        is: "true",
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    //Additionnal verification
    if (value.moreInformation === "true" && value.handicap === "false" && value.ppsBeneficiary === "false" && value.paiBeneficiary === "false") {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.moreInformation === "false" && (value.handicap === "true" || value.ppsBeneficiary === "true" || value.paiBeneficiary === "true")) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.moreInformation === "false") {
      value.specificAmenagment = "false";
      value.reducedMobilityAccess = "false";
      value.handicapInSameDepartment = "false";
    }

    if (value.highSkilledActivity === "false") {
      value.highSkilledActivityInSameDepartment = "false";
    }

    value.inscriptionStep = STEPS.REPRESENTANTS;
    delete value.moreInformation;

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });

    await inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/representant", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      //Parent1
      parent1Status: Joi.string().trim().required().valid("mother", "father", "representant"),
      parent1FirstName: validateFirstName().trim().required(),
      parent1LastName: Joi.string().uppercase().trim().required(),
      parent1Email: Joi.string().lowercase().trim().email().required(),
      parent1Phone: Joi.string().trim().required(),
      parent1OwnAddress: Joi.string().trim().required().valid("true", "false"),
      parent1FromFranceConnect: Joi.string().trim().required().valid("true", "false"),

      //If parent1OwnAdress
      parent1City: Joi.alternatives().conditional("parent1OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent1Zip: Joi.alternatives().conditional("parent1OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent1Address: Joi.alternatives().conditional("parent1OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent1Country: Joi.alternatives().conditional("parent1OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),

      //If parent1OwnAdress and parent1Country === France
      addressParent1Verified: Joi.alternatives().conditional("parent1OwnAddress", {
        is: "true",
        then: Joi.alternatives().conditional("parent1Country", { is: "France", then: Joi.string().trim().required().valid("true"), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),
      parent1Location: Joi.alternatives().conditional("parent1OwnAddress", {
        is: "true",
        then: Joi.alternatives().conditional("parent1Country", {
          is: "France",
          then: Joi.object()
            .keys({
              lat: Joi.number().required().allow(null),
              lon: Joi.number().required().allow(null),
            })
            .default({
              lat: null,
              lon: null,
            })
            .allow({}, null),
          otherwise: Joi.isError(new Error()),
        }),
        otherwise: Joi.isError(new Error()),
      }),
      parent1Department: Joi.alternatives().conditional("parent1OwnAddress", {
        is: "true",
        then: Joi.alternatives().conditional("parent1Country", { is: "France", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),
      parent1Region: Joi.alternatives().conditional("parent1OwnAddress", {
        is: "true",
        then: Joi.alternatives().conditional("parent1Country", { is: "France", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),

      //Parent2
      parent2: Joi.string().trim().required().valid(true, false),

      //Parent2 informed
      parent2Status: Joi.alternatives().conditional("parent2", { is: true, then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent2FirstName: Joi.alternatives().conditional("parent2", { is: true, then: validateFirstName().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent2LastName: Joi.alternatives().conditional("parent2", { is: true, then: Joi.string().uppercase().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent2Email: Joi.alternatives().conditional("parent2", { is: true, then: Joi.string().lowercase().trim().email().required(), otherwise: Joi.isError(new Error()) }),
      parent2Phone: Joi.alternatives().conditional("parent2", { is: true, then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
      parent2OwnAddress: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.string().trim().required().valid("true", "false"),
        otherwise: Joi.isError(new Error()),
      }),
      parent2FromFranceConnect: Joi.string().trim().required().valid("true", "false"),

      //If parent2 and parent1OwnAdress
      parent2City: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),
      parent2Zip: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),
      parent2Address: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),
      parent2Country: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", { is: "true", then: Joi.string().trim().required(), otherwise: Joi.isError(new Error()) }),
        otherwise: Joi.isError(new Error()),
      }),

      //If parent2 and parent1OwnAdress and parent2Country === France
      addressParent2Verified: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", {
          is: "true",
          then: Joi.alternatives().conditional("parent2Country", {
            is: "France",
            then: Joi.string().trim().required().valid("true"),
            otherwise: Joi.isError(new Error()),
          }),
          otherwise: Joi.isError(new Error()),
        }),
        otherwise: Joi.isError(new Error()),
      }),

      parent2Location: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", {
          is: "true",
          then: Joi.alternatives().conditional("parent2Country", {
            is: "France",
            then: Joi.object()
              .keys({
                lat: Joi.number().required().allow(null),
                lon: Joi.number().required().allow(null),
              })
              .default({
                lat: null,
                lon: null,
              })
              .allow({}, null),
            otherwise: Joi.isError(new Error()),
          }),
          otherwise: Joi.isError(new Error()),
        }),
        otherwise: Joi.isError(new Error()),
      }),

      parent2Department: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", {
          is: "true",
          then: Joi.alternatives().conditional("parent2Country", {
            is: "France",
            then: Joi.string().trim().required(),
            otherwise: Joi.isError(new Error()),
          }),
          otherwise: Joi.isError(new Error()),
        }),
        otherwise: Joi.isError(new Error()),
      }),

      parent2Region: Joi.alternatives().conditional("parent2", {
        is: true,
        then: Joi.alternatives().conditional("parent2OwnAddress", {
          is: "true",
          then: Joi.alternatives().conditional("parent2Country", {
            is: "France",
            then: Joi.string().trim().required(),
            otherwise: Joi.isError(new Error()),
          }),
          otherwise: Joi.isError(new Error()),
        }),
        otherwise: Joi.isError(new Error()),
      }),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (value.parent1OwnAddress === "false") {
      value.parent1City = "";
      value.parent1Zip = "";
      value.parent1Address = "";
      value.parent1Location = { lat: null, lon: null };
      value.parent1Department = "";
      value.parent1Region = "";
      value.parent1Country = "";
    } else if (value.parent1Country !== "France") {
      value.parent1Location = { lat: null, lon: null };
      value.parent1Department = "";
      value.parent1Region = "";
    }

    if (value.parent2) {
      if (value.parent2OwnAddress === "false") {
        value.parent2City = "";
        value.parent2Zip = "";
        value.parent2Address = "";
        value.parent2Location = { lat: null, lon: null };
        value.parent2Department = "";
        value.parent2Region = "";
        value.parent2Country = "";
      } else if (value.parent2Country !== "France") {
        value.parent2Location = { lat: null, lon: null };
        value.parent2Department = "";
        value.parent2Region = "";
      }
      delete value.addressParent2Verified;
    } else {
      value.parent2Status = "";
      value.parent2FirstName = "";
      value.parent2LastName = "";
      value.parent2Email = "";
      value.parent2Phone = "";
      value.parent2OwnAddress = "false";
      value.parent2City = "";
      value.parent2Zip = "";
      value.parent2Address = "";
      value.parent2Location = { lat: null, lon: null };
      value.parent2Department = "";
      value.parent2Region = "";
      value.parent2Country = "";
      value.parent2FromFranceConnect = "false";
    }

    delete value.parent2;
    delete value.addressParent1Verified;
    value.inscriptionStep = STEPS.CONSENTEMENTS;

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });

    await inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/representant-fromFranceConnect/:id", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const id = req.params.id;
    const { error, value } = Joi.object({
      [`parent${id}FirstName`]: validateFirstName().trim().required(),
      [`parent${id}LastName`]: Joi.string().uppercase().trim().required(),
      [`parent${id}Email`]: Joi.string().lowercase().trim().email().required(),
      [`parent${id}FromFranceConnect`]: Joi.string().trim().required().valid("true"),
    }).validate(req.body);

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    young.set(value);
    await young.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/consentements", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    const young = await YoungObject.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const needMoreConsent = getAge(young.birthdateAt) < 15;
    const { error, value } = Joi.object({
      parentConsentment1: Joi.boolean().required().valid(true),
      parentConsentment2: Joi.boolean().required().valid(true),
      parentConsentment3: Joi.boolean().required().valid(true),
      parentConsentment4: Joi.boolean().required().valid(true),
      parentConsentment5: Joi.boolean().required().valid(true),
      parentConsentment6: Joi.alternatives().conditional("$needMoreConsent", {
        is: Joi.boolean().valid(true).required(),
        then: Joi.boolean().required().valid(true),
        otherwise: Joi.isError(new Error()),
      }),
      parentConsentment7: Joi.boolean().required().valid(true),
      consentment1: Joi.boolean().required().valid(true),
      consentment2: Joi.alternatives().conditional("$needMoreConsent", {
        is: Joi.boolean().valid(true).required(),
        then: Joi.boolean().required().valid(true),
        otherwise: Joi.isError(new Error()),
      }),
    }).validate(req.body, { context: { needMoreConsent: needMoreConsent } });

    if (error) {
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canUpdateYoungStatus({ body: value, current: young })) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const consentements = {
      parentConsentment: "true",
      consentment: "true",
      inscriptionStep: STEPS.DOCUMENTS,
    };

    young.set(consentements);
    await young.save({ fromUser: req.user });

    await inscriptionCheck(consentements, young, req);

    return res.status(200).send({ ok: true, data: serializeYoung(young) });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

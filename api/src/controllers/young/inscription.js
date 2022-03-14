const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const Joi = require("joi");

const YoungObject = require("../../models/young");
const { canUpdateYoungStatus } = require("snu-lib");
const { capture } = require("../../sentry");
const { validateFirstName } = require("../../utils/validator");

const { ERRORS, YOUNG_SITUATIONS, STEPS, inscriptionCheck } = require("../../utils");

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

    return res.status(200).send({ ok: true, data: young });
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
        .required(),
      department: Joi.string().trim().required(),
      region: Joi.string().trim().required(),
      cityCode: Joi.string().trim().required(),
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
        then: Joi.alternatives().conditional("schoolCountry", { is: "France", then: Joi.string().trim().required(), otherwise: Joi.string().default("").allow("", null) }),
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

    inscriptionCheck(value, young, req);

    return res.status(200).send({ ok: true, data: young });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

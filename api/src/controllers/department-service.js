const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { canCreateOrUpdateDepartmentService, canViewDepartmentService, department2region, ROLES } = require("snu-lib");
const { capture } = require("../sentry");
const { DepartmentServiceModel, ReferentModel, CohortModel } = require("../models");
const { ERRORS, isYoung, isReferent } = require("../utils");
const { validateDepartmentService } = require("../utils/validator");
const { serializeDepartmentService, serializeArray } = require("../utils/serializer");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedDepartementService } = validateDepartmentService(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (!canCreateOrUpdateDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    let service = await DepartmentServiceModel.findOne({ department: checkedDepartementService.department });

    if (service) {
      service.set(checkedDepartementService);
      await service.save({ fromUser: req.user });
    } else {
      service = await DepartmentServiceModel.create(checkedDepartementService);
    }

    return res.status(200).send({ ok: true, data: serializeDepartmentService(service, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/cohort/:cohort/contact", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      cohort: Joi.string().required(),
      contactName: Joi.string().allow(null, ""),
      contactPhone: Joi.string().allow(null, ""),
      contactMail: Joi.string().allow(null, ""),
      contactId: Joi.string().allow(null, ""),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateOrUpdateDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const departmentService = await DepartmentServiceModel.findById(value.id);
    if (!departmentService) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const newContact = {
      cohort: value.cohort,
      contactName: value.contactName,
      contactPhone: value.contactPhone,
      contactMail: value.contactMail,
    };

    let contacts = [...departmentService.contacts];

    const contactIndex = contacts.findIndex((contact) => contact._id.toString() === value.contactId);
    const alreadyExist = contactIndex !== -1;
    if (!alreadyExist) {
      // checking if the contact for this cohort already exists...
      if (contacts.filter((c) => c.cohort === value.cohort).length > 3) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      //... if not, we add it
      contacts.push(newContact);
    } else {
      //... if yes, we update it
      contacts[contactIndex] = newContact;
    }
    const updatedData = await DepartmentServiceModel.findByIdAndUpdate(value.id, { contacts }, { new: true, upsert: true, useFindAndModify: false });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id/cohort/:cohort/contact/:contactId", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      cohort: Joi.string().required(),
      contactId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateOrUpdateDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const departmentService = await DepartmentServiceModel.findById(value.id);
    if (!departmentService) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    // checking if the contact for this cohort already exists...
    let contacts = [...departmentService.contacts];

    const exist = contacts.findIndex((contact) => contact._id.toString() === value.contactId);
    if (exist === -1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    contacts = contacts.filter((contact) => contact._id.toString() !== value.contactId);

    const updatedData = await DepartmentServiceModel.findByIdAndUpdate(value.id, { contacts }, { new: true, upsert: true, useFindAndModify: false });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:department", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: department } = Joi.string().required().validate(req.params.department);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (isYoung(req.user) && req.user.department !== department) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (isReferent(req.user) && !canViewDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await DepartmentServiceModel.findOne({ department });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await DepartmentServiceModel.find({});
    if (!canViewDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeDepartmentService) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:cohortId/DepartmentServiceContact/export", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ cohortId: Joi.string().required() }).validate(req.params, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const cohortDocument = await CohortModel.findById(value.cohortId);
    if (!cohortDocument) return res.status(404).json({ ok: false, code: ERRORS.NOT_FOUND, error: "Cohorte introuvable" });

    const cohortName = cohortDocument.name;
    const services = await DepartmentServiceModel.find({ department: { $in: cohortDocument.eligibility.zones } }).lean();

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const referentsRegion = await ReferentModel.find({ role: ROLES.REFERENT_REGION }).lean();
    const referentsDep = await ReferentModel.find({
      role: ROLES.REFERENT_DEPARTMENT,
      lastLoginAt: { $gte: twoWeeksAgo },
      subRole: { $nin: "manager_phase2" },
    })
      .sort({ lastLoginAt: -1 })
      .lean();

    const resultSansContact = {};
    const resultAvecContact = {};

    for (const service of services) {
      const refsRegion = referentsRegion.filter((r) => r.region === department2region[service.department ?? ""]).slice(0, 2);
      const refsDep = referentsDep.filter((r) => service.department.includes(r.department)).slice(0, 4);
      const contacts = service?.contacts;
      const contact = contacts?.find((c) => c.cohort === cohortName);

      const row = {
        Département: service.department,
        Région: department2region[service.department ?? ""] || "N/A",
        "Email des Référents Départementaux": refsDep.map((r) => r.email).join("; "),
        "Email des Référents Régionaux": refsRegion.map((r) => r.email).join("; "),
        "Contact convoquation renseigné": contact ? "OUI" : "NON",
      };

      if (!contact) {
        resultSansContact.push(row);
      } else {
        resultAvecContact.push(row);
      }
    }

    // Trier les résultats par région
    resultSansContact.sort((a, b) => a.Région.localeCompare(b.Région));
    resultAvecContact.sort((a, b) => a.Région.localeCompare(b.Région));

    return res.json({ resultSansContact, resultAvecContact, cohortName });
  } catch (error) {
    capture(error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/representant", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      mobile: Joi.string().required(),
      email: Joi.string().required(),
      role: Joi.string().required(),
    }).validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canCreateOrUpdateDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const departmentService = await DepartmentServiceModel.findById(value.id);
    if (!departmentService) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const newRepresentant = {
      firstName: value.firstName,
      lastName: value.lastName,
      mobile: value.mobile,
      email: value.email,
      role: value.role,
    };

    const updatedData = await DepartmentServiceModel.findByIdAndUpdate(value.id, { representantEtat: newRepresentant }, { new: true, upsert: true, useFindAndModify: false });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

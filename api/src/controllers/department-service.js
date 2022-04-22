const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const DepartmentServiceModel = require("../models/departmentService");
const { ERRORS, isYoung } = require("../utils");
const { validateDepartmentService } = require("../utils/validator");
const { serializeDepartmentService, serializeArray } = require("../utils/serializer");

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedDepartementService } = validateDepartmentService(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await DepartmentServiceModel.findOneAndUpdate({ department: checkedDepartementService.department }, checkedDepartementService, {
      new: true,
      upsert: true,
      useFindAndModify: false,
    });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
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
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const departmentService = await DepartmentServiceModel.findById(value.id);
    if (!departmentService) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const newContact = {
      cohort: value.cohort,
      contactName: value.contactName,
      contactPhone: value.contactPhone,
      contactMail: value.contactMail,
    };

    // checking if the contact for this cohort already exists...
    const alreadyExist = departmentService.contacts.find((c) => c.cohort === value.cohort);
    let contacts = [...departmentService.contacts];
    if (!alreadyExist) {
      //... if not, we add it
      contacts.push(newContact);
    } else {
      //... if yes, we update it
      contacts = departmentService.contacts.map((c) => {
        if (value.cohort !== c.cohort) return c;
        return newContact;
      });
    }
    const updatedData = await DepartmentServiceModel.findByIdAndUpdate(value.id, { contacts }, { new: true, upsert: true, useFindAndModify: false });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:department", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: department } = Joi.string().required().validate(req.params.department);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (isYoung(req.user) && req.user.department !== department) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await DepartmentServiceModel.findOne({ department });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await DepartmentServiceModel.find({});
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeDepartmentService) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

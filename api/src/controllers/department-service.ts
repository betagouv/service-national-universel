import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import { canCreateOrUpdateDepartmentService, canViewDepartmentService, department2region, ROLES } from "snu-lib";
import { capture } from "../sentry";
import { DepartmentServiceModel, ReferentModel, CohortModel } from "../models";
import { DepartmentServiceRoutes, MIME_TYPES } from "snu-lib";
import { ERRORS, isYoung, isReferent } from "../utils";
import { validateDepartmentService } from "../utils/validator";
import { serializeDepartmentService, serializeArray } from "../utils/serializer";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { accessControlMiddleware } from "../middlewares/accessControlMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { UserRequest, RouteRequest, RouteResponse } from "./request";
import XLSX from "xlsx";
import { idSchema } from "../utils/validator";
const router = express.Router();

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

    return res.status(200).send({ ok: true, data: serializeDepartmentService(service) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/cohort/:cohort/contact", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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

    let contacts: any[] = [...departmentService.contacts];

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
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id/cohort/:cohort/contact/:contactId", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
    let contacts: any[] = [...departmentService.contacts];

    const exist = departmentService.contacts.findIndex((contact: any) => contact._id.toString() === value.contactId);
    if (exist === -1) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    contacts = contacts.filter((contact) => contact._id.toString() !== value.contactId);

    const updatedData = await DepartmentServiceModel.findByIdAndUpdate(value.id, { contacts }, { new: true, upsert: true, useFindAndModify: false });
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:department", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
    return res.status(200).send({ ok: true, data: serializeDepartmentService(data) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const data = await DepartmentServiceModel.find({});
    if (!canViewDepartmentService(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeDepartmentService) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.use(authMiddleware("referent"));
router.get(
  "/:sessionId/DepartmentServiceContact/export",
  accessControlMiddleware([ROLES.ADMIN]),
  requestValidatorMiddleware({
    params: Joi.object<DepartmentServiceRoutes["ExportContacts"]["params"]>({ sessionId: idSchema().required() }),
  }),
  async (req: RouteRequest<DepartmentServiceRoutes["ExportContacts"]>, res: RouteResponse<DepartmentServiceRoutes["ExportContacts"]>) => {
    try {
      const cohortDocument = await CohortModel.findById(req.validatedParams.sessionId);
      if (!cohortDocument) return res.status(404).json({ ok: false, code: ERRORS.NOT_FOUND, message: "Cohorte introuvable" });

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

      const resultSansContact: Array<{
        Département: string;
        Région: string;
        "Email des Référents Départementaux": string;
        "Email des Référents Régionaux": string;
        "Contact convoquation renseigné": string;
      }> = [];
      const resultAvecContact: Array<{
        Département: string;
        Région: string;
        "Email des Référents Départementaux": string;
        "Email des Référents Régionaux": string;
        "Contact convoquation renseigné": string;
      }> = [];

      for (const service of services) {
        const refsRegion = referentsRegion.filter((r) => r.region === department2region[service.department ?? ""]).slice(0, 2);
        const refsDep = referentsDep.filter((r) => r.department.includes(service.department!)).slice(0, 4);
        const contacts = service?.contacts;
        const contact = contacts?.find((c) => c.cohort === cohortName);

        const row = {
          Département: service.department ?? "N/A",
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

      // Créer le fichier Excel
      const workbook = XLSX.utils.book_new();
      const worksheetSansContact = XLSX.utils.json_to_sheet(resultSansContact);
      const worksheetAvecContact = XLSX.utils.json_to_sheet(resultAvecContact);

      XLSX.utils.book_append_sheet(workbook, worksheetSansContact, "Sans Contact");
      XLSX.utils.book_append_sheet(workbook, worksheetAvecContact, "Avec Contact");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

      const contentData = excelBuffer.toString("base64");

      return res.status(200).send({
        ok: true,
        data: { base64: contentData, mimeType: MIME_TYPES.EXCEL, fileName: `${cohortName}_export_MissingContact.xlsx` },
      });
    } catch (error) {
      capture(error);
      return res.status(500).json({ ok: false, code: ERRORS.SERVER_ERROR, message: "Erreur serveur" });
    }
  },
);

router.post("/:id/representant", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
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
    return res.status(200).send({ ok: true, data: serializeDepartmentService(updatedData) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

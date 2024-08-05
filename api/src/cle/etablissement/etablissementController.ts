import express, { Response } from "express";
import passport from "passport";
import Joi from "joi";
import {
  CLE_TYPE_LIST,
  CLE_SECTOR_LIST,
  SUB_ROLES,
  ROLES,
  canUpdateEtablissement,
  canViewEtablissement,
  isAdmin,
  departmentToAcademy,
  isChefEtablissement,
  isReferentOrAdmin,
  SENDINBLUE_TEMPLATES,
} from "snu-lib";
import { ReferentDto } from "snu-lib/src/dto";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";
import { UserRequest } from "../../controllers/request";
import { idSchema } from "../../utils/validator";
import { sendTemplate } from "../../brevo";

const router = express.Router();

router.get("/from-user", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const searchField = req.user.role === ROLES.REFERENT_CLASSE ? "_id" : req.user.subRole === SUB_ROLES.referent_etablissement ? "referentEtablissementIds" : "coordinateurIds";
    const query = {};
    let valueField: any = { $in: [req.user._id] };
    if (req.user.role === ROLES.REFERENT_CLASSE) {
      const classe = await ClasseModel.findOne({ referentClasseIds: { $in: req.user._id } });
      if (!classe) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      valueField = classe.etablissementId;
    }
    query[searchField] = valueField;
    const etablissement = await EtablissementModel.findOne(query)?.lean();
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await populateEtablissementWithCoordinateur(etablissement);
    await populateEtablissementWithReferent(etablissement);
    if (req.user.role === ROLES.REFERENT_CLASSE) await populateEtablissementWithClasse(etablissement, req.user);

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value: id } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(id).lean();
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await populateEtablissementWithCoordinateur(etablissement);
    await populateEtablissementWithReferent(etablissement);

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      zip: Joi.string().required(),
      city: Joi.string().required(),
      department: Joi.string().required(),
      region: Joi.string().required(),
      academy: Joi.string().required(),
      state: Joi.string().valid("active", "inactive").required(),
      schoolYears: Joi.array().items(Joi.string()).required(),
      type: Joi.array()
        .items(Joi.string().valid(...CLE_TYPE_LIST))
        .required(),
      sector: Joi.array()
        .items(Joi.string().valid(...CLE_SECTOR_LIST))
        .required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canUpdateEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(value.id);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (value.department !== etablissement.department) {
      value.academy = departmentToAcademy[value.department];
    }

    etablissement.set({
      ...value,
    });
    await etablissement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/:id/referents", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error, value } = Joi.object({
      id: Joi.string().required(),
      referentEtablissementIds: Joi.array().items(Joi.string()).max(1).required(),
    })
      .unknown()
      .validate({ ...req.params, ...req.body }, { stripUnknown: true });

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!isAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(value.id);
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    etablissement.set({
      referentEtablissementIds: value.referentEtablissementIds,
    });
    await etablissement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: etablissement });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// DELETE /cle/etablissement/:id/referents
router.delete("/:id/referents", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { error: idError, value: id } = validateId(req.params.id);
    const { error, value: payload } = Joi.object()
      .keys({
        referentIds: Joi.array().items(idSchema()).min(1).required(),
      })
      .validate(req.body, { stripUnknown: true });
    if (idError || error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    if (!isChefEtablissement(req.user) && !isReferentOrAdmin(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const etablissement = await EtablissementModel.findById(id);
    if (!etablissement) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // on récupère les coordinateurs
    const referents = await ReferentModel.find({ _id: { $in: payload.referentIds } });
    if (referents.length !== payload.referentIds.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    // les référents sont bien des coordinateurs
    const etablissements = await EtablissementModel.find({ coordinateurIds: { $in: payload.referentIds } });
    if (etablissements.length !== payload.referentIds.length) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (etablissements.some((e) => e._id.toString() !== etablissement._id.toString())) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    for (const referent of referents) {
      // si il est aussi référent de classe
      const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
      if (classe) {
        referent.set({
          role: ROLES.REFERENT_CLASSE,
          subRole: SUB_ROLES.none,
        });
      } else {
        referent.set({ deletedAt: new Date() });
      }
      await referent.save({ fromUser: req.user });
      const toName = `${referent.firstName}  ${referent.lastName}`;
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.COORIDNIATEUR_REMOVED_ETABLISSEMENT, {
        emailTo: [{ email: referent.email, name: toName }],
        params: {
          toName,
        },
      });
    }
    etablissement.set({
      coordinateurIds: etablissement.coordinateurIds.filter((id) => !payload.referentIds.includes(id.toString())),
    });
    await etablissement.save({ fromUser: req.user });

    return res.status(200).send({ ok: true, data: payload.referentIds });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

function toReferentDto(referent: any): ReferentDto {
  return {
    _id: referent._id,
    firstName: referent.firstName,
    lastName: referent.lastName,
    role: referent.role,
    subRole: referent.subRole,
    phone: referent.phone,
    email: referent.email,
  };
}

async function populateEtablissementWithCoordinateur(etablissement) {
  const coordinateurs = await ReferentModel.find({ _id: { $in: etablissement.coordinateurIds } }).lean();
  etablissement.coordinateurs = coordinateurs.map(toReferentDto);
  return etablissement;
}

async function populateEtablissementWithReferent(etablissement) {
  const referents = await ReferentModel.find({ _id: { $in: etablissement.referentEtablissementIds } }).lean();
  etablissement.referents = referents.map(toReferentDto);
  return etablissement;
}

async function populateEtablissementWithClasse(etablissement, user) {
  let classes;
  if (user.role === ROLES.REFERENT_CLASSE) {
    const classe = await ClasseModel.findOne({ referentClasseIds: { $in: user._id } });
    classes = [classe];
  } else {
    classes = await ClasseModel.find({ etablissementId: etablissement._id }).lean();
  }
  etablissement.classes = classes;
  return etablissement;
}

export default router;

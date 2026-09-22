import express, { Response } from "express";
import passport from "passport";
import { SUB_ROLES, ROLES, canViewEtablissement, ClasseSchoolYear } from "snu-lib";
import { ReferentDto } from "snu-lib";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { validateId } from "../../utils/validator";
import { ClasseModel, EtablissementModel, ReferentModel } from "../../models";
import { UserRequest } from "../../controllers/request";
import { buildUniqueClasseKey } from "../classe/classeService";

const router = express.Router();

router.get("/from-user", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    if (!canViewEtablissement(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const searchField = req.user.role === ROLES.REFERENT_CLASSE ? "_id" : req.user.subRole === SUB_ROLES.referent_etablissement ? "referentEtablissementIds" : "coordinateurIds";
    const query = {};
    let valueField: any = { $in: [req.user._id] };
    if (req.user.role === ROLES.REFERENT_CLASSE) {
      const classes = await ClasseModel.find({ referentClasseIds: { $in: req.user._id } });
      if (!classes || classes.length === 0) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      const lastClasse = classes.find((classe) => classe.schoolYear === ClasseSchoolYear.YEAR_2024_2025) || classes[0];
      valueField = lastClasse.etablissementId;
    }
    query[searchField] = valueField;
    const etablissement = await EtablissementModel.findOne(query)?.lean();
    if (!etablissement) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    await populateEtablissementWithCoordinateur(etablissement);
    await populateEtablissementWithReferent(etablissement);
    if (req.user.role === ROLES.REFERENT_CLASSE) await populateEtablissementWithClasse(etablissement, req.user);

    const uniqueKey = buildUniqueClasseKey(etablissement);

    return res.status(200).send({ ok: true, data: { ...etablissement, uniqueKey } });
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

    const uniqueKey = buildUniqueClasseKey(etablissement);

    return res.status(200).send({ ok: true, data: { ...etablissement, uniqueKey } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
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

async function isUAIValid(uai: string): Promise<boolean> {
  const etablissement = await EtablissementModel.findOne({ uai });
  return !etablissement;
}

export default router;

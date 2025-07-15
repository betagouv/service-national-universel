import express from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { logger } from "../logger";

import { StructureModel, MissionModel, ReferentModel, ApplicationModel } from "../models";
import { ERRORS } from "../utils";
import {
  ROLES,
  canDeleteStructure,
  canViewStructureChildren,
  isSupervisor,
  isAdmin,
  SENDINBLUE_TEMPLATES,
  StructureType,
  UserDto,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
  isReadAuthorized,
  isWriteAuthorized,
  isResponsible,
} from "snu-lib";
import patches from "./patches";
import { sendTemplate } from "../brevo";
import { validateStructure, validateStructureManager, idSchema } from "../utils/validator";
import { serializeStructure, serializeArray, serializeMission } from "../utils/serializer";
import { serializeMissions, serializeReferents } from "../utils/es-serializer";
import { allRecords } from "../es/utils";
import { requestValidatorMiddleware } from "../middlewares/requestValidatorMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { RouteRequest, RouteResponse, UserRequest } from "./request";
import { permissionAccessControlMiddleware } from "../middlewares/permissionAccessControlMiddleware";

const setAndSave = async (data: any, keys: Record<string, any>, fromUser?: UserDto): Promise<void> => {
  data.set({ ...keys });
  await data.save({ fromUser });
};

const populateWithMissions = async (structures: StructureType[]): Promise<StructureType[]> => {
  const structureIds = [...new Set(structures.map((item) => item._id))].filter(Boolean);
  const missions = await allRecords("mission", { bool: { filter: [{ terms: { "structureId.keyword": structureIds } }] } });
  const serializedMissions = serializeMissions(missions);
  return structures.map((item) => ({ ...item, missions: serializedMissions.filter((e) => e.structureId === item._id.toString()) }));
};

const populateWithReferents = async (structures: StructureType[]): Promise<StructureType[]> => {
  const departments = [...new Set(structures.map((item) => item.department))].filter(Boolean);
  const referents = await allRecords("referent", {
    bool: { must: [{ terms: { "department.keyword": departments } }, { term: { "role.keyword": "referent_department" } }] },
  });
  const serializedReferents = serializeReferents(referents);
  return structures.map((item) => ({ ...item, referents: serializedReferents.filter((e) => item.department?.includes(e.department)) }));
};

const populateWithTeam = async (structures: StructureType[]): Promise<StructureType[]> => {
  const structureIds = [...new Set(structures.map((item) => item._id))].filter(Boolean);
  const referents = await allRecords("referent", { bool: { filter: [{ terms: { "structureId.keyword": structureIds } }] } });
  const serializedReferents = serializeReferents(referents);
  return structures.map((item) => ({ ...item, team: serializedReferents.filter((e) => e.structureId === item._id.toString()) }));
};

// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure: StructureType, fromUser: UserDto): Promise<void> {
  if (structure.networkId) {
    // When the structure is a child (part of a network), get the network
    const network = await StructureModel.findById(structure.networkId);
    // then update networkName thanks to its name.
    if (network) await setAndSave(structure, { networkName: network.name }, fromUser);
  } else if (structure.isNetwork === "true") {
    // When the structure is a partent (is a network).
    // Update the structure itself (a parent belongs to her own structure).
    await setAndSave(structure, { networkName: structure.name }, fromUser);
    // Then update their childs.
    const childs = await StructureModel.find({ networkId: structure._id });
    for (const child of childs) await setAndSave(child, { networkName: structure.name }, fromUser);
  }
}

async function updateMissionStructureName(structure: StructureType, fromUser?: UserDto): Promise<void> {
  try {
    const missions = await MissionModel.find({ structureId: structure._id });
    if (!missions?.length) {
      logger.debug(`no missions edited for structure ${structure._id}`);
      return;
    }
    for (const mission of missions) await setAndSave(mission, { structureName: structure.name }, fromUser);
  } catch (error) {
    capture(error);
  }
}

async function updateResponsibleAndSupervisorRole(structure: StructureType, fromUser?: UserDto): Promise<void> {
  try {
    const referents = await ReferentModel.find({ structureId: structure._id, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    if (!referents?.length) {
      logger.debug(`no referents edited for structure ${structure._id}`);
      return;
    }
    for (const referent of referents) await setAndSave(referent, { role: structure.isNetwork === "true" ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE }, fromUser);
  } catch (error) {
    capture(error);
  }
}

const router = express.Router();

router.post(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.CREATE, ignorePolicy: true }]),
  async (req: UserRequest, res: express.Response) => {
    try {
      console.log("req.body", req.body.name);
      const { error, value: checkedStructure } = validateStructure(req.body);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      if (isSupervisor(req.user)) {
        checkedStructure.networkId = req.user.structureId;
      }

      const data = await StructureModel.create(checkedStructure);
      await updateNetworkName(data, req.user);
      await updateResponsibleAndSupervisorRole(data, req.user);
      sendTemplate(SENDINBLUE_TEMPLATES.referent.STRUCTURE_REGISTERED, {
        emailTo: [{ name: `${req.user.firstName} ${req.user.lastName}`, email: `${req.user.email}` }],
      });
      return res.status(200).send({ ok: true, data: serializeStructure(data, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.put(
  "/:id",
  authMiddleware(["referent"]),
  requestValidatorMiddleware({
    params: Joi.object({ id: idSchema().required() }),
  }),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (
        !isWriteAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: structure.toJSON() },
        })
      ) {
        return res.status(403).json({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const { error: errorStructure, value: checkedStructure } = validateStructure(req.body);
      if (errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

      // un responsable ne peux pas passer en tête de réseau la structure
      if (isResponsible(req.user) && checkedStructure && structure.isNetwork !== "true" && checkedStructure.isNetwork === "true") {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }
      // Only admin user can change the networkId of a structure
      if (!isAdmin(req.user)) {
        delete checkedStructure.networkId;
      }

      structure.set(checkedStructure);
      await structure.save({ fromUser: req.user });
      await updateNetworkName(structure, req.user);
      await updateMissionStructureName(structure, req.user);
      await updateResponsibleAndSupervisorRole(structure, req.user);
      return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/networks",
  authMiddleware(["referent"]),
  [permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }])],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const data = await StructureModel.find({ isNetwork: "true" }).sort("name");
      if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/children",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const data = await StructureModel.find({ networkId: structure._id });
      return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/mission",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const missions = await MissionModel.find({ structureId: req.validatedParams.id });
      if (!missions) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data: missions.map(serializeMission) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/:id/patches",
  authMiddleware("referent"),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      const structurePatches = await patches.get(req, StructureModel);
      if (!structurePatches) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      return res.status(200).send({ ok: true, data: structurePatches });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: error.message });
    }
  },
);

router.get(
  "/:id",
  authMiddleware(["referent", "young"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const checkedId = req.validatedParams.id;

      const data = await StructureModel.findById(checkedId);
      if (!data) return res.status(404).json({ ok: false, code: ERRORS.NOT_FOUND });
      let structure = serializeStructure(data, req.user);
      if (
        !isReadAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: { ...structure, _id: data._id.toString() } },
        })
      ) {
        return res.status(403).json({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      if (req.query.withMissions || req.query.withReferents || req.query.withTeam) {
        let promises: Promise<any[]>[] = [];

        if (req.query.withMissions) promises.push(populateWithMissions([structure]));
        //   @ts-ignore
        else promises.push(async () => [structure]);

        if (req.query.withReferents && structure.department) promises.push(populateWithReferents([structure]));
        //   @ts-ignore
        else promises.push(async () => [structure]);

        if (req.query.withTeam) promises.push(populateWithTeam([structure]));
        //   @ts-ignore
        else promises.push(async () => [structure]);

        const [responseWithMissions, responseWithReferents, responseWithTeam] = await Promise.all(promises);
        const populatedStructures = [structure].map((item, index) => ({
          ...item,
          missions: responseWithMissions[index]?.missions || [],
          referents: responseWithReferents[index]?.referents || [],
          team: responseWithTeam[index]?.team || [],
        }));

        structure = populatedStructures[0];
      }

      return res.status(200).json({ ok: true, data: structure });
    } catch (error) {
      capture(error);
      res.status(500).json({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.get(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const data = await StructureModel.find({});
      return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete(
  "/:id",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.DELETE, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (!canDeleteStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const missionsLinkedToReferent = await MissionModel.find({ structureId: req.validatedParams.id });

      const applicationsLinkedToReferent = await ApplicationModel.find({ missionId: { $in: missionsLinkedToReferent.map((mission) => mission._id) } });

      if (applicationsLinkedToReferent.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });

      const referentsLinkedToStructure = await ReferentModel.find({ structureId: req.validatedParams.id });

      for (const referent of referentsLinkedToStructure) {
        await referent.deleteOne();
      }

      for (const mission of missionsLinkedToReferent) {
        await mission.deleteOne();
      }

      await structure.deleteOne();
      logger.debug(`Structure ${req.params.id} has been deleted by ${req.user._id}`);
      res.status(200).send({ ok: true });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post(
  "/:id/representant",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const { error, value } = validateStructureManager(req.body);
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      if (
        !isWriteAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: structure.toJSON() },
        })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      structure.set({ structureManager: value });
      await structure.save({ fromUser: req.user });
      return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.delete(
  "/:id/representant",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.WRITE, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      if (
        !isWriteAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: structure.toJSON() },
        })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      structure.set({ structureManager: undefined });
      await structure.save({ fromUser: req.user });
      return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;

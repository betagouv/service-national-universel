const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const { logger } = require("../logger");

const { StructureModel, MissionModel, ReferentModel, ApplicationModel } = require("../models");
const { ERRORS } = require("../utils");
const {
  ROLES,
  canModifyStructure,
  canDeleteStructure,
  canCreateStructure,
  canViewMission,
  canViewStructures,
  canViewStructureChildren,
  isSupervisor,
  isAdmin,
  SENDINBLUE_TEMPLATES,
} = require("snu-lib");
const patches = require("./patches");
const { sendTemplate } = require("../brevo");
const { validateId, validateStructure, validateStructureManager } = require("../utils/validator");
const { serializeStructure, serializeArray, serializeMission } = require("../utils/serializer");
const { serializeMissions, serializeReferents } = require("../utils/es-serializer");
const { allRecords } = require("../es/utils");

const setAndSave = async (data, keys, fromUser) => {
  data.set({ ...keys });
  await data.save({ fromUser });
};

const populateWithMissions = async (structures) => {
  const structureIds = [...new Set(structures.map((item) => item._id))].filter(Boolean);
  const missions = await allRecords("mission", { bool: { filter: [{ terms: { "structureId.keyword": structureIds } }] } });
  const serializedMissions = serializeMissions(missions);
  return structures.map((item) => ({ ...item, missions: serializedMissions.filter((e) => e.structureId === item._id.toString()) }));
};

const populateWithReferents = async (structures) => {
  const departments = [...new Set(structures.map((item) => item.department))].filter(Boolean);
  const referents = await allRecords("referent", {
    bool: { must: [{ terms: { "department.keyword": departments } }, { term: { "role.keyword": "referent_department" } }] },
  });
  const serializedReferents = serializeReferents(referents);
  return structures.map((item) => ({ ...item, referents: serializedReferents.filter((e) => item.department.includes(e.department)) }));
};

const populateWithTeam = async (structures) => {
  const structureIds = [...new Set(structures.map((item) => item._id))].filter(Boolean);
  const referents = await allRecords("referent", { bool: { filter: [{ terms: { "structureId.keyword": structureIds } }] } });
  const serializedReferents = serializeReferents(referents);
  return structures.map((item) => ({ ...item, team: serializedReferents.filter((e) => e.structureId === item._id.toString()) }));
};

// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure, fromUser) {
  if (structure.networkId) {
    // When the structure is a child (part of a network), get the network
    const network = await StructureModel.findById(structure.networkId);
    // then update networkName thanks to its name.
    if (network) await setAndSave(structure, { networkName: network.name });
  } else if (structure.isNetwork === "true") {
    // When the structure is a partent (is a network).
    // Update the structure itself (a parent belongs to her own structure).
    await setAndSave(structure, { networkName: structure.name });
    // Then update their childs.
    const childs = await StructureModel.find({ networkId: structure._id });
    for (const child of childs) await setAndSave(child, { networkName: structure.name }, fromUser);
  }
}
async function updateMissionStructureName(structure) {
  try {
    const missions = await MissionModel.find({ structureId: structure._id });
    if (!missions?.length) {
      logger.debug(`no missions edited for structure ${structure._id}`);
      return;
    }
    for (const mission of missions) await setAndSave(mission, { structureName: structure.name });
  } catch (error) {
    capture(error);
  }
}

async function updateResponsibleAndSupervisorRole(structure) {
  try {
    const referents = await ReferentModel.find({ structureId: structure._id, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    if (!referents?.length) {
      logger.debug(`no referents edited for structure ${structure._id}`);
      return;
    }
    for (const referent of referents) await setAndSave(referent, { role: structure.isNetwork === "true" ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE });
  } catch (error) {
    capture(error);
  }
}

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedStructure } = validateStructure(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    if (!canCreateStructure(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

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
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

    const structure = await StructureModel.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canModifyStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorStructure, value: checkedStructure } = validateStructure(req.body);
    if (errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

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
});

router.get("/networks", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await StructureModel.find({ isNetwork: "true" }).sort("name");
    if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/children", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const structure = await StructureModel.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await StructureModel.find({ networkId: structure._id });
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/mission", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const data = await MissionModel.find({ structureId: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewMission(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    return res.status(200).send({ ok: true, data: data.map(serializeMission) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, StructureModel));

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewStructures(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await StructureModel.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    let structure = serializeStructure(data, req.user);

    if (req.query.withMissions || req.query.withReferents || req.query.withTeam) {
      let promises = [];

      if (req.query.withMissions) promises.push(populateWithMissions([structure]));
      else promises.push(async () => [structure]);

      if (req.query.withReferents && structure.department) promises.push(populateWithReferents([structure]));
      else promises.push(async () => [structure]);

      if (req.query.withTeam) promises.push(populateWithTeam([structure]));
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

    return res.status(200).send({ ok: true, data: structure });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canViewStructures(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await StructureModel.find({});
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const structure = await StructureModel.findById(checkedId);
    if (!canDeleteStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const missionsLinkedToReferent = await MissionModel.find({ structureId: checkedId });

    const applicationsLinkedToReferent = await ApplicationModel.find({ missionId: { $in: missionsLinkedToReferent.map((mission) => mission._id) } });

    if (applicationsLinkedToReferent.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });

    const referentsLinkedToStructure = await ReferentModel.find({ structureId: checkedId });

    for (const referent of referentsLinkedToStructure) {
      await referent.remove();
    }

    for (const mission of missionsLinkedToReferent) {
      await mission.remove();
    }

    await structure.remove();
    logger.debug(`Structure ${req.params.id} has been deleted by ${req.user._id}`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post("/:id/representant", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateStructureManager(req.body);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }
    const { error: errorId, value: structureId } = validateId(req.params.id);
    if (errorId) {
      capture(errorId);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    const structure = await StructureModel.findById(structureId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canModifyStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    structure.set({ structureManager: value });
    await structure.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.delete("/:id/representant", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = validateId(req.params.id);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }

    if (!canModifyStructure(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const structure = await StructureModel.findById(value);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    structure.set({ structureManager: undefined });
    await structure.save({ fromUser: req.user });
    return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

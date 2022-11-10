const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const StructureObject = require("../models/structure");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");
const ApplicationObject = require("../models/application");
const { ERRORS } = require("../utils");
const { ROLES, canModifyStructure, canDeleteStructure, canCreateStructure, canViewMission, canViewStructures, canViewStructureChildren } = require("snu-lib/roles");
const patches = require("./patches");
const { sendTemplate } = require("../sendinblue");
const { validateId, validateStructure } = require("../utils/validator");
const { serializeStructure, serializeArray, serializeMission } = require("../utils/serializer");
const { SENDINBLUE_TEMPLATES } = require("snu-lib/constants");

const setAndSave = async (data, keys, fromUser) => {
  data.set({ ...keys });
  await data.save({ fromUser });
};

// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure, fromUser) {
  if (structure.networkId) {
    // When the structure is a child (part of a network), get the network
    const network = await StructureObject.findById(structure.networkId);
    // then update networkName thanks to its name.
    if (network) await setAndSave(structure, { networkName: network.name });
  } else if (structure.isNetwork === "true") {
    // When the structure is a partent (is a network).
    // Update the structure itself (a parent belongs to her own structure).
    await setAndSave(structure, { networkName: structure.name });
    // Then update their childs.
    const childs = await StructureObject.find({ networkId: structure._id });
    for (const child of childs) await setAndSave(child, { networkName: structure.name }, fromUser);
  }
}
async function updateMissionStructureName(structure) {
  try {
    const missions = await MissionObject.find({ structureId: structure._id });
    if (!missions?.length) return console.log(`no missions edited for structure ${structure._id}`);
    for (const mission of missions) await setAndSave(mission, { structureName: structure.name });
  } catch (error) {
    capture(error);
  }
}

async function updateResponsibleAndSupervisorRole(structure) {
  try {
    const referents = await ReferentObject.find({ structureId: structure._id, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    if (!referents?.length) return console.log(`no referents edited for structure ${structure._id}`);
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
    const data = await StructureObject.create(checkedStructure);
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

    const structure = await StructureObject.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canModifyStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorStructure, value: checkedStructure } = validateStructure(req.body);
    if (errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });

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
    const data = await StructureObject.find({ isNetwork: "true" }).sort("name");
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

    const structure = await StructureObject.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await StructureObject.find({ networkId: structure._id });
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

    const data = await MissionObject.find({ structureId: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canViewMission(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    return res.status(200).send({ ok: true, data: data.map(serializeMission) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => await patches.get(req, res, StructureObject));

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    if (!canViewStructures(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const data = await StructureObject.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeStructure(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    if (!canViewStructures(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const data = await StructureObject.find({});
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

    const structure = await StructureObject.findById(checkedId);
    if (!canDeleteStructure(req.user, structure)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const missionsLinkedToReferent = await MissionObject.find({ structureId: checkedId });
    // ? Supprimer les missions et responsables par la même occasion ?
    const applicationsLinkedToReferent = await ApplicationObject.find({ missionId: { $in: missionsLinkedToReferent.map((mission) => mission._id) } });
    if (applicationsLinkedToReferent.length) return res.status(409).send({ ok: false, code: ERRORS.LINKED_OBJECT });

    const referentsLinkedToStructure = await ReferentObject.find({ structureId: checkedId });

    for (const referent of referentsLinkedToStructure) {
      referent.set({ structureId: undefined });
      await referent.save({ fromUser: req.user });
    }

    await structure.remove();
    console.log(`Structure ${req.params.id} has been deleted by ${req.user._id}`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const StructureObject = require("../models/structure");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");
const { ERRORS } = require("../utils");
const { ROLES, canModifyStructure, canDeleteStructure } = require("snu-lib/roles");
const patches = require("./patches");
const { validateId, validateStructure } = require("../utils/validator");
const { serializeStructure, serializeArray, serializeMission } = require("../utils/serializer");

const setAndSave = async (data, keys) => {
  data.set({ ...keys });
  await data.save();
};

// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure) {
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
    for (const child of childs) await setAndSave(child, { networkName: structure.name });
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

router.post("/", async (req, res) => {
  try {
    const { error, value: checkedStructure } = validateStructure(req.body);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await StructureObject.create(checkedStructure);
    await updateNetworkName(data);
    await updateResponsibleAndSupervisorRole(data);
    return res.status(200).send({ ok: true, data: serializeStructure(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorId });

    const structure = await StructureObject.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (!canModifyStructure(req.user, structure)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    const { error: errorStructure, value: checkedStructure } = validateStructure(req.body);
    if (errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error: errorStructure });

    structure.set(checkedStructure);
    await structure.save({ fromUser: req.user });
    await updateNetworkName(structure);
    await updateMissionStructureName(structure);
    await updateResponsibleAndSupervisorRole(structure);
    return res.status(200).send({ ok: true, data: serializeStructure(structure, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/networks", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await StructureObject.find({ isNetwork: "true" }).sort("name");
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/children", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: errorId });

    const structure = await StructureObject.findById(checkedId);
    if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const data = await StructureObject.find({ networkId: structure._id });
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id/mission", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value: checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error });

    const data = await MissionObject.find({ structureId: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: data.map(serializeMission) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get(
  "/:id/patches",
  passport.authenticate("referent", { session: false, failWithError: true }),
  async (req, res) => await patches.get(req, res, StructureObject)
);

router.get("/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: errorId });

    const data = await StructureObject.findById(checkedId);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    return res.status(200).send({ ok: true, data: serializeStructure(data, req.user) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await StructureObject.find({});
    return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error: errorId, value: checkedId } = validateId(req.params.id);
    if (errorId) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: errorId });

    const structure = await StructureObject.findById(checkedId);
    if (!canDeleteStructure(req.user, structure)) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    await structure.remove();
    console.log(`Structure ${req.params.id} has been deleted by ${req.user._id}`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const StructureObject = require("../models/structure");
const MissionObject = require("../models/mission");
const ReferentObject = require("../models/referent");
const { ERRORS } = require("../utils");
const { ROLES } = require("snu-lib/roles");

// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure) {
  if (structure.networkId) {
    // When the structure is a child (part of a network).
    // Get network for the structure, then update networkName thanks to its name.
    const network = await StructureObject.findOne({ _id: structure.networkId });
    if (network) {
      structure.set({ networkName: `${network.name}` });
      await structure.save();
    }
  } else if (structure.isNetwork === "true") {
    // When the structure is a partent (is a network).
    // Update the structure itself (a parent belongs to her own structure).
    structure.set({ networkName: `${structure.name}` });
    await structure.save();
    // Then update their childs.
    const childs = await StructureObject.find({ networkId: structure._id });
    for (const child of childs) {
      child.set({ networkName: `${structure.name}` });
      await child.save();
    }
  }
}
async function updateMissionStructureName(structure) {
  try {
    const missions = await MissionObject.find({ structureId: structure._id });
    if (!missions?.length) return console.log(`no missions edited for structure ${structure._id}`);
    for (const mission of missions) {
      mission.set({ structureName: structure.name });
      await mission.save();
    }
  } catch (error) {
    capture(error);
  }
}

async function updateResponsibleAndSupervisorRole(structure) {
  try {
    const referents = await ReferentObject.find({ structureId: structure._id, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });
    if (!referents?.length) return console.log(`no referents edited for structure ${structure._id}`);
    for (const referent of referents) {
      referent.set({ role: structure.isNetwork ? ROLES.SUPERVISOR : ROLES.RESPONSIBLE });
      await referent.save();
    }
  } catch (error) {
    capture(error);
  }
}

router.post("/", async (req, res) => {
  try {
    const data = await StructureObject.create(req.body);
    await updateNetworkName(data);
    await updateResponsibleAndSupervisorRole(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    let obj = req.body;
    const data = await StructureObject.findByIdAndUpdate(req.user.structureId, obj, { new: true });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await updateNetworkName(data);
    await updateMissionStructureName(data);
    await updateResponsibleAndSupervisorRole(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    let obj = req.body;
    const data = await StructureObject.findByIdAndUpdate(req.params.id, obj, { new: true });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    await updateNetworkName(data);
    await updateMissionStructureName(data);
    await updateResponsibleAndSupervisorRole(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/networks", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.find({ isNetwork: "true" }).sort("name");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/network/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.find({ networkId: req.params.id });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/all", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.find({});
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.get("/:id/patches", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const structure = await StructureObject.findById(req.params.id);
    if (!structure) {
      capture(`structure not found ${req.params.id}`);
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    const data = await structure.patches.find({ ref: structure.id }).sort("-date");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.findOne({ _id: req.params.id });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const data = await StructureObject.findById(req.user.structureId);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const structure = await StructureObject.findOne({ _id: req.params.id });
    await structure.remove();
    console.log(`Structure ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

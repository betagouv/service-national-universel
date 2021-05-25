const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const StructureObject = require("../models/structure");
const { 
  ERRORS,
} = require("../utils");

const {
  validateId
} = require("../utils/defaultValidate");

const validateFromReferent = require ("../utils/referent")


// Update "network name" to ease search ("Affilié à un réseau national" filter).
// See: https://trello.com/c/BjRN9NME/523-admin-filtre-affiliation-%C3%A0-une-t%C3%AAte-de-r%C3%A9seau
async function updateNetworkName(structure) {
  if (structure.networkId) {
    // When the structure is a child (part of a network).
    // Get network for the structure, then update networkName thanks to its name.
    const { error, value : checkedNetworkId } = validateId(structure.networkId)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const network = await StructureObject.findOne({ _id: checkedNetworkId });
    if (network) {
      structure.set({ networkName: `${network.name}` });
      await structure.save();
      await structure.index();
    }
  } else if (structure.isNetwork === "true") {
    // When the structure is a partent (is a network).
    // Update the structure itself (a parent belongs to her own structure).
    const { error, value : checkedStructureName } = validateId(structure.name)
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    structure.set({ networkName: `${checkedStructureName}` });
    await structure.save();
    await structure.index();
    // Then update their childs.
    const childs = await StructureObject.find({ networkId: structure._id });
    for (const child of childs) {
      child.set({ networkName: `${structure.name}` });
      await child.save();
      await child.index();
    }
  }
}

router.post("/", async (req, res) => {
  try {
    const { error, value : checkedStructure } = validateFromReferent.validateStructure(req.body);
    if(error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await StructureObject.create(checkedStructure);
    await updateNetworkName(data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { errorId, value : checkedId } = validateId(req.user.structureId);
    const { errorStructure, value : checkedStructure } = validateFromReferent.validateStructure(req.body);
    if(errorId || errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    let obj = checkedStructure;
    const data = await StructureObject.findByIdAndUpdate(checkedId, obj, { new: true });
    await updateNetworkName(data);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { errorId, value : checkedId } = validateId(req.params.id);
    const { errorStructure, value : checkedStructure } = validateFromReferent.validateStructure(req.body);
    if(errorId || errorStructure) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    let obj = checkedStructure;
    const data = await StructureObject.findByIdAndUpdate(checkedId, obj, { new: true });
    await updateNetworkName(data);
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
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
    const { error, value : checkedId} = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const data = await StructureObject.find({ networkId: checkedId });
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

router.get("/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const data = await StructureObject.findOne({ _id: checkedId });
    if (!data) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY, error });
    const data = await StructureObject.findById(checkedId);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("referent", { session: false }), async (req, res) => {
  try {
    const { error, value : checkedId } = validateId(req.params.id);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_URI, error });
    const structure = await StructureObject.findOne({ _id: checkedId });
    await structure.remove();
    console.log(`Structure ${req.params.id} has been deleted`);
    res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, error, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

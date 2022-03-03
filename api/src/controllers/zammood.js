const express = require("express");
const router = express.Router();
const passport = require("passport");
const slack = require("../slack");

const { capture } = require("../sentry");
const zammood = require("../zammood");
const { ERRORS } = require("../utils");

router.get("/tickets", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await zammood.api(`/ticket?email=${req.user.email}`, { method: "GET", credentials: "include" });
    if (!data.ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get one tickets with its messages.
router.get("/ticket/:id", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { ok, data } = await zammood.api(`/v0/ticket?clientId=${req.params.id}`, { method: "GET", credentials: "include" });
    if (!ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    const messages = await zammood.api(`/v0/message?ticketId=${data[0]._id}`, { method: "GET", credentials: "include" });
    if (!messages.ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    return res.status(200).send({ ok: true, data: messages.data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Create a new ticket while authenticated
router.post("/ticket", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { subject, message, clientId } = req.body;
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email: req.user.email,
        subject,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        source: "PLATFORM",
        clientId,
      }),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Create a new ticket for public users => not used for now
router.post("/ticket/form", async (req, res) => {
  try {
    const { subject, message, email, firstName, lastName, zammadId } = req.body;
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email,
        zammadId,
        subject,
        firstName,
        lastName,
        source: "FORM",
      }),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/ticket/:id/message", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        lastName: req.user.lastName,
        firstName: req.user.firstName,
        email: req.user.email,
        message: req.body.message,
        clientId: req.params.id,
      }),
    });
    if (!response.ok) slack.error({ title: "Create message Zammod", text: JSON.stringify(e) });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

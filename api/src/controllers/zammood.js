const express = require("express");
const router = express.Router();
const passport = require("passport");

const { capture } = require("../sentry");
const zammood = require("../zammood");
const { ERRORS } = require("../utils");

// Get one tickets with its articles.
router.get("/ticket/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const data = await zammood.api("v0/message?zammadId=" + req.params.id, { method: "GET", credentials: "include" });
    if (!data.ok) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    console.log("GET ZAMMOOD 🍕", data);
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Create a new ticket while authenticated
router.post("/ticket", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email: req.user.email,
        zammadId: response.id,
        subject,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        source: req.user ? "PLATFORM" : "FORM",
      }),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    console.log("POST ZAMMOOD", response);
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/ticket/form", async (req, res) => {
  try {
    const { subject, message, email, firstName, lastName } = req.body;
    const response = await zammood.api("/v0/message", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        message,
        email,
        zammadId: response.id,
        subject,
        firstName,
        lastName,
        source: "FORM",
      }),
    });
    if (!response.ok) return res.status(400).send({ ok: false, code: response });
    console.log("POST ZAMMOOD", response);
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

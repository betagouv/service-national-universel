const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const zammad = require("../zammad");
const { ZAMMAD_TOKEN, ZAMMAD_URL } = require("../config");

const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

router.get("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const res = await fetch(`${ZAMMAD_URL}/api/v1/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: ZAMMAD_TOKEN },
    });
    if (!res.ok) console.log("OH NOOO...", res.error);
    const responseAsJson = await response.json();
    const dataUrl = responseAsJson.data.generateUrl;

    return res.status(200).send({ ok: true, data: { url: dataUrl } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/ticket", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { subject, group, message } = req.body;
    console.log({ subject, group, message });

    const response = await zammad.api("/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: `${group} - ${subject}`,
        group,
        // guess: req.user.email,
        customer: req.user.email,
        article: {
          subject,
          body: message,
          type: "note",
          internal: false,
        },
        note: "some note...",
      }),
    });

    console.log("---RESPONSE---", response);
    console.log("---STATUS---", response.status);

    if (!response.ok) return res.status(400).send({ ok: false });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

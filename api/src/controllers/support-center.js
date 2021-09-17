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
    const { subject, type, message } = req.body;
    // const email = "jeamichel@test.com";
    const email = req.user.email;

    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    const response = await zammad.api("/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: `${type} - ${subject}`,
        group: "Users",
        customer_id,
        customer: email,
        article: {
          subject,
          body: message,
          // type:'note',
          internal: false,
        },
      }),
    });
    if (!response.id) return res.status(400).send({ ok: false });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

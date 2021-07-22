const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");

const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

router.get("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const res = await fetch(`${process.env.ZAMMAD_URL}/api/v1/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json", "Authorization": process.env.ZAMMAD_TOKEN },
    });
    console.log('RESPONSE', res);
    if (!res.ok) console.log('OH NOOO...', res.error);
    console.log('YEAAAAH ! 🎉', res.ok);
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
    let url = `${process.env.ZAMMAD_URL}/api/v1/tickets`;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ZAMMAD_TOKEN}` },
      body: JSON.stringify({
        "title": "Help me!",
        "group": "Users",
        "customer": "chloe@selego.co",
        "article": {
          "subject": "some subject",
          "body": "some message",
          "type": "note",
        },
      }),
    };
    const response = await fetch(url, options);
    //const responseAsJson = await response.json();
    console.log("---RESPONSE---", response);
    //const dataUrl = responseAsJson.data.generateUrl;

    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
    res.status(400).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

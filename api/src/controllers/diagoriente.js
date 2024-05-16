const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const { DIAGORIENTE_TOKEN, DIAGORIENTE_URL } = require("../config");

const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

router.get("/generateUrl", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    let url = DIAGORIENTE_URL;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"query":"{ generateUrl(token:\\"${DIAGORIENTE_TOKEN}\\" ,id:\\"${req.user._id}\\",firstName:\\"${req.user.firstName}\\",lastName:\\"${req.user.lastName}\\") }","variables":null}`,
    };
    const response = await fetch(url, options);
    const responseAsJson = await response.json();
    const dataUrl = responseAsJson.data.generateUrl;

    return res.status(200).send({ ok: true, data: { url: dataUrl } });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/getCard", passport.authenticate("young", { session: false, failWithError: true }), async (req, res) => {
  try {
    let url = DIAGORIENTE_URL;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"query": "{ getCard(token:\\"${DIAGORIENTE_TOKEN}\\",id: \\"${req.user._id}\\") { skills{ endDate startDate activities {title} theme { title type activities { title } } } globalCompetences { title value type } }}","variables":{}}`,
    };
    const response = await fetch(url, options);
    const responseAsJson = await response.json();
    const data = responseAsJson.data?.getCard;

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

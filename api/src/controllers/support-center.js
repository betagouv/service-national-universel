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
    console.log('USER ?', req.user);
    if (req.user.zammadToken) {
      const zammadUser = await fetch(`${process.env.ZAMMAD_URL}/api/v1/users/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${req.user.zammadToken}` }
      });
      if (!zammadUser) return console.log("USER DOESN'T EXIST", zammadUser);
      return console.log("USER EXISTS", zammadUser);
    }
    let url = `${process.env.ZAMMAD_URL}/api/v1/users`
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ZAMMAD_TOKEN}` },
      body: JSON.stringify(
        {
          "firstname": req.user.firstName,
          "lastname": req.user.lastName,
          "email": req.user.email,
          "vip": false,
          "active": true,
          "role_ids": [
            3
          ],
        }
      ),
    };
    const response = await fetch(url, options);
    console.log('---RESPONSE---', response);
    console.log('---STATUS---', response.status);
    if (!response.ok) return res.status(400).send({ ok: false });
    const tokenResponse = await fetch(`${process.env.ZAMMAD_URL}/api/v1/user_access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ZAMMAD_TOKEN}` },
      body: JSON.stringify({
        "label": "Customer Token",
        "permission": ["ticket.customer", "user_preferences"],
        "expires_at": null
      })
    });
    console.log('---TOKEN RESPONSE---', tokenResponse, tokenResponse.data);
    return res.status(200).send({ ok: true, token: tokenResponse.name });

    // let url = `${process.env.ZAMMAD_URL}/api/v1/tickets`;
    // let options = {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.ZAMMAD_TOKEN}` },
    //   body: JSON.stringify(req.body),
    // };
    // const response = await fetch(url, options);
    // //const responseAsJson = await response.json();
    // console.log("---RESPONSE---", response);
    //const dataUrl = responseAsJson.data.generateUrl;

    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
    res.status(400).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

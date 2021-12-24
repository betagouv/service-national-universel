const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { getToken } = require("../passport");
const config = require("../config");
const { serializeYoung, serializeReferent } = require("../utils/serializer");
const { ERRORS } = require("../utils");

const Young = require("../models/young");
const Referent = require("../models/referent");
const { capture } = require("../sentry");

router.get("/token", async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).send({ ok: false, user: { restriction: "public" } });
    const jwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) reject(err);
        resolve(decoded);
      });
    });
    if (!jwtPayload) return res.status(401).send({ ok: false, user: { restriction: "public" } });
    const { error, value } = Joi.object({ _id: Joi.string().required() }).validate({ _id: jwtPayload._id });
    if (error) return res.status(200).send({ ok: true, user: { restriction: "public" } });

    const young = await Young.findById(value._id);
    if (young) {
      young.set({ lastLoginAt: Date.now() });
      await young.save();
      return res.status(200).send({ ok: true, user: { ...serializeYoung(young, young), restriction: "young" } });
    }
    const referent = await Referent.findById(value._id);
    if (referent) {
      referent.set({ lastLoginAt: Date.now() });
      await referent.save();
      return res.status(200).send({ ok: true, user: { ...serializeReferent(referent, referent), restriction: "referent" } });
    }
    return res.status(401).send({ ok: false, user: { restriction: "public" } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, user: null });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");
const { capture } = require("../sentry");

const SupportUserObject = require("../models/supportUser");
const { ERRORS } = require("../utils");

const getSupportUser = async (req, res) => {
  try {
    const supportUser = await SupportUserObject.findById(req.user._id);
    if (!supportUser) {
      res.status(401).send({ ok: false, code: ERRORS.USER_NOT_FOUND });
    }
    req.user = supportUser;
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
};

router.post("/", passport.authenticate("referent", { session: false, failWithError: true }), getSupportUser, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ ok: false, code: "Veuillez fournir un email" });
    const user = await SupportUserObject.findOne({ email });
    if (!user) res.status(400).send({ ok: false, code: ERRORS.USER_NOT_FOUND });
    const updatedUser = {};

    if (req.body.hasOwnProperty("projectUserId")) updatedUser.projectUserId = req.body.projectUserId;
    if (req.body.hasOwnProperty("status")) updatedUser.status = req.body.status;
    if (req.body.hasOwnProperty("firstName")) updatedUser.firstName = req.body.firstName;
    if (req.body.hasOwnProperty("lastName")) updatedUser.lastName = req.body.lastName;
    if (req.body.hasOwnProperty("email")) updatedUser.email = req.body.email;
    if (req.body.hasOwnProperty("lastLoginAt")) updatedUser.lastLoginAt = req.body.lastLoginAt;
    if (req.body.hasOwnProperty("registerdAt")) updatedUser.registerdAt = req.body.registerdAt;
    if (req.body.hasOwnProperty("role")) updatedUser.role = req.body.role;
    if (req.body.hasOwnProperty("filters")) updatedUser.filters = req.body.filters;

    user.set(updatedUser);
    await user.save();

    return res.status(200).send({ ok: true, user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.get("/signin_token", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({ token: Joi.string().required() }).validate({ token: req.cookies.jwt });
    if (error) return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });

    // automatic creation of support user
    let supportUser = await SupportUserObject.findById(req.user._id);
    if (!supportUser) {
      supportUser = await SupportUserObject.create({
        _id: req.user._id,
        projectUserId: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
      });
    }
    supportUser.set({ lastLoginAt: Date.now() });
    await supportUser.save();
    return res.status(200).send({ ok: true, token: value.token, user: supportUser });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.put("/:supportUserId", passport.authenticate("referent", { session: false, failWithError: true }), getSupportUser, async (req, res) => {
  try {
    const user = await SupportUserObject.findById(req.params.supportUserId);
    if (!user) res.status(400).send({ ok: false, code: ERRORS.USER_NOT_FOUND });
    const updatedUser = {};

    if (req.body.hasOwnProperty("projectUserId")) updatedUser.projectUserId = req.body.projectUserId;
    if (req.body.hasOwnProperty("status")) updatedUser.status = req.body.status;
    if (req.body.hasOwnProperty("firstName")) updatedUser.firstName = req.body.firstName;
    if (req.body.hasOwnProperty("lastName")) updatedUser.lastName = req.body.lastName;
    if (req.body.hasOwnProperty("email")) updatedUser.email = req.body.email;
    if (req.body.hasOwnProperty("lastLoginAt")) updatedUser.lastLoginAt = req.body.lastLoginAt;
    if (req.body.hasOwnProperty("registerdAt")) updatedUser.registerdAt = req.body.registerdAt;
    if (req.body.hasOwnProperty("role")) updatedUser.role = req.body.role;
    if (req.body.hasOwnProperty("filters")) updatedUser.filters = req.body.filters;

    user.set(updatedUser);
    await user.save();

    return res.status(200).send({ ok: true, user });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

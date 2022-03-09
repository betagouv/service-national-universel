const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { capture } = require("../sentry");
const ReferentModel = require("../models/referent");
const MissionModel = require("../models/mission");
const ApplicationModel = require("../models/application");
const StructureModel = require("../models/structure");
const config = require("../config");
const { ROLES, APPLICATION_STATUS } = require("snu-lib/constants");
const { JWT_MAX_AGE, cookieOptions } = require("../cookie-options");
const { ERRORS } = require("../utils");

router.get("/signin", async (req, res) => {
  try {
    let { email, token } = req.query;

    if (!email || !token || token.toString() !== config.JVA_SIGNIN_TOKEN.toString()) {
      return res.status(401).send({ ok: false, code: "TOKEN_OR_EMAIL_INVALID" });
    }

    const user = await ReferentModel.findOne({ email, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

    // si l'utilisateur n'existe pas, on bloque
    if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    // si l'utilisateur existe, on le connecte, et on le redirige vers la plateforme admin SNU
    if (user) {
      user.set({ lastLoginAt: Date.now() });
      await user.save();

      const token = jwt.sign({ _id: user.id }, config.secret, { expiresIn: JWT_MAX_AGE });
      res.cookie("jwt", token, cookieOptions());

      return res.redirect(config.ADMIN_URL);
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.get("/actions", async (req, res) => {
  try {
    let { email, token } = req.query;
    const x = req.header("authorization");
    console.log("✍️ ~ x", x);

    // améliorer token ?
    if (!email || !token || token.toString() !== config.JVA_SIGNIN_TOKEN.toString()) {
      return res.status(401).send({ ok: false, code: "TOKEN_OR_EMAIL_INVALID" });
    }

    const user = await ReferentModel.findOne({ email, role: { $in: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR] } });

    // si l'utilisateur n'existe pas, on bloque
    if (!user || user.status === "DELETED") return res.status(401).send({ ok: false, code: ERRORS.EMAIL_OR_PASSWORD_INVALID });

    // si l'utilisateur existe, on récupère les missions + candidatures qui lui sont liées
    if (user) {
      const structure = await StructureModel.findById(user.structureId);
      const missions = await MissionModel.find({ tutorId: user._id.toString() });
      for (let mission of missions) {
        // const applications = await ApplicationModel.find({ missionId: mission._id, status: { $in: [APPLICATION_STATUS.WAITING_VALIDATION] } });
        const applications = await ApplicationModel.find({ missionId: mission._id });
        mission.applications = applications.map((m) => ({
          status: m.status,
        }));
      }

      return res.status(200).send({ ok: true, data: { structure: { name: structure.name }, missions: missions.map((m) => ({ name: m.name, applications: m.applications })) } });
    }
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

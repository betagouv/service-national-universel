const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const { capture } = require("../sentry");
const WaitingListModel = require("../models/waitingList");
const { API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY } = require("../config.js");
const { ERRORS } = require("../utils");
const { validateWaitingList } = require("../utils/validator");
const { sendTemplate } = require("../sendinblue");
const Joi = require("joi");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

async function getAccessToken(endpoint, apiKey) {
  const response = await fetch(`${endpoint}/auth/token`, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  const data = await response.json();
  if (data.ok == true && data.token) {
    return data.token;
  } else {
    throw new Error("Couldn't retrieve auth token");
  }
}

function postParams(token) {
  return {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "*",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  };
}

// Compter les jeunes qui ont changé de statut dans une période 
// Pour 1..n départements ou 1..n régions ou au global
router.post("/young-status/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      status: Joi.string().valid("VALIDATED", "WAITING_VALIDATION", "WITHDRAWN").required(),
      startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
      endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    }).oxor('region', 'department').validate(req.body);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);
    const response = await fetch(`${API_ANALYTICS_ENDPOINT}/stats/young-status/count`, {
      ...postParams(token),
      body: JSON.stringify({
        region: value.region,
        department: value.department,
        status: value.status,
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    });
    const result = await response.json();
    return res.status(200).send({ ok: true, data: result.data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Compter les jeunes qui ont changé de cohorte dans une période 
// Pour 1..n départements ou 1..n régions ou au global
router.post("/young-cohort/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      region: Joi.array().items(Joi.string()),
      department: Joi.array().items(Joi.string()),
      startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
      endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    }).oxor('region', 'department').validate(req.body);

    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
    }

    const token = await getAccessToken(API_ANALYTICS_ENDPOINT, API_ANALYTICS_API_KEY);
    const response = await fetch(`${API_ANALYTICS_ENDPOINT}/stats/young-cohort/count`, {
      ...postParams(token),
      body: JSON.stringify({
        region: value.region,
        department: value.department,
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    });
    const result = await response.json();
    console.log(result);
    return res.status(200).send({ ok: true, data: result.data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

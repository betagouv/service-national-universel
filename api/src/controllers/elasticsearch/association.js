const passport = require("passport");
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const { canSearchAssociation } = require("snu-lib");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const config = require("config");

const apiEngagement = async ({ path = "/", body }) => {
  try {
    const myHeaders = new fetch.Headers();
    myHeaders.append("X-API-KEY", config.API_ENGAGEMENT_KEY);
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(body),
    };
    const res = await fetch(`${config.API_ENGAGEMENT_URL}${path}`, requestOptions);
    return await res.json();
  } catch (e) {
    capture(e, { extra: { path: path } });
  }
};

router.post("/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { user, body } = req;

    if (!canSearchAssociation(user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

    if (req.params.action === "export") {
      const associations = [];
      let total;
      let maxIteration = 1000;
      let page = 0;
      while (associations.length < (total ?? 200) && maxIteration > 0) {
        const response = await apiEngagement({ path: `/v0/association/snu`, body: { ...body, page, size: 100 } });
        if (!response.responses[0]?.hits?.hits?.length) break;
        if (!total) total = response.responses[0].hits.total.value;
        associations.push(...response.responses[0].hits.hits.map((hit) => ({ _id: hit._id, ...hit._source })));
        maxIteration--;
        page++;
      }
      return res.status(200).send({ ok: true, data: associations });
    }

    const response = await apiEngagement({ path: `/v0/association/snu`, body });
    return res.status(200).send(response);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

const https = require("https");
const passport = require("passport");
const express = require("express");
const router = express.Router();

const { capture } = require("../sentry");

const esClient = require("../es");

router.post("/_msearch", passport.authenticate(["young", "referent"], { session: false }), (req, res) => exec(req, res, ""));

router.post("/mission/_msearch", passport.authenticate(["young", "referent"], { session: false }), (req, res) => exec(req, res, "mission"));
router.post("/young/_msearch", passport.authenticate(["referent"], { session: false }), (req, res) => exec(req, res, "young"));
router.post("/structure/_msearch", passport.authenticate(["referent"], { session: false }), (req, res) => exec(req, res, "structure"));
router.post("/referent/_msearch", passport.authenticate(["referent"], { session: false }), (req, res) => exec(req, res, "referent"));

async function exec(req, res, index = "") {
  try {
    const body = req.body;
    const user = req.user;

    //Dirty hack for young. They should access only to school. I think we need to do a separate route @raph
    if (user.constructor.modelName === "young" && !index) {
      const d = await esClient.msearch({ index: "school", body: body });
      return res.status(200).send(d.body);
    }

    const bodyFiltered = await filter(body, user, index);
    let i = index ? [index] : [];
    const d = await esClient.msearch({ index: i, body: bodyFiltered });
    return res.status(200).send(d.body);
  } catch (error) {
    console.log("ERROR", JSON.stringify(error));

    capture(error);
    res.status(500).send({ error });
  }
}

function filter(body, user, index) {
  let filter = [];
  if (user.role === "admin") return body;

  filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "WAITING_CORRECTION", "REFUSED", "VALIDATED"] } });
  // filter.push({ terms: { "phase.keyword": ["INSCRIPTION"] } });

  if (user.role === "referent_region") filter.push({ term: { "region.keyword": user.region } });
  if (user.role === "referent_department") filter.push({ term: { "department.keyword": user.department } });

  const arr = body.split(`\n`);
  const newArr = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (!(i % 2)) {
      newArr.push(arr[i]);
    } else {
      // query
      const str = arr[i];
      const q = JSON.parse(str);
      if (!q.query.bool) {
        if (q.query.match_all) {
          q.query = { bool: { must: { match_all: {} } } };
        } else {
          const tq = q.query;
          delete q.query;
          q.query = { bool: { must: tq } };
        }
      }
      if (q.query.bool.filter) {
        q.query.bool.filter = [...q.query.bool.filter, ...filter];
      } else {
        q.query.bool.filter = filter;
      }

      newArr.push(JSON.stringify(q));
    }
  }
  return newArr.join(`\n`) + `\n`;
}

module.exports = router;

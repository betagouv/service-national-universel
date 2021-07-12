const express = require("express");
const passport = require("passport");
const router = express.Router({ mergeParams: true });
const { capture } = require("../../sentry");
const renderFromHtml = require("../../htmlToPdf");
const YoungObject = require("../../models/young");
const { ERRORS } = require("../../utils");
const certificate = require("../../templates/certificate");
const form = require("../../templates/form");
const convocation = require("../../templates/convocation");

router.post("/certificate/:template", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  const young = await YoungObject.findById(req.params.id);
  if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const options = req.body.options || { format: "A4", margin: 0 };

  //create html
  let newhtml = "";
  if (req.params.template === "1") {
    newhtml = certificate.phase1(young);
  } else if (req.params.template === "2") {
    newhtml = certificate.phase2(young);
  } else if (req.params.template === "3") {
    newhtml = certificate.phase3(young);
  } else if (req.params.template === "snu") {
    newhtml = certificate.snu(young);
  }

  if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const buffer = await renderFromHtml(newhtml, options);
  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
});

router.post("/form/:template", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  const young = await YoungObject.findById(req.params.id);
  if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const options = req.body.options || { format: "A4", margin: 0 };
  //create html
  let newhtml = "";
  if (req.params.template === "imageRight") {
    newhtml = form.imageRight(req.body.young);
  } else if (req.params.template === "autotestPCR") {
    newhtml = form.autotestPCR(req.body.young);
  }

  if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

  const buffer = await renderFromHtml(newhtml, options);
  res.contentType("application/pdf");
  res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
  res.set("Cache-Control", "public, max-age=1");
  res.send(buffer);
});

router.post("/convocation/:template", passport.authenticate(["young", "referent"], { session: false }), async (req, res) => {
  try {
    console.log(`${req.params.id} download convocation`);
    const young = await YoungObject.findById(req.params.id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const options = req.body.options || { format: "A4", margin: 0 };
    //create html
    let newhtml = "";
    if (req.params.template === "cohesion") {
      newhtml = await convocation.cohesion(req.body.young);
    }

    if (!newhtml) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    const buffer = await renderFromHtml(newhtml, options);
    res.contentType("application/pdf");
    res.setHeader("Content-Dispositon", 'inline; filename="test.pdf"');
    res.set("Cache-Control", "public, max-age=1");
    res.send(buffer);
  } catch (e) {
    capture(e);
    res.status(500).send({ ok: false, e, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;

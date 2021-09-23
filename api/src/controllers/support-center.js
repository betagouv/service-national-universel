const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../sentry");
const zammad = require("../zammad");
const { ZAMMAD_TOKEN, ZAMMAD_URL } = require("../config");

const fetch = require("node-fetch");
const { ERRORS } = require("../utils");

// PAS ouf cette route
// router.get("/", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
//   try {
//     const res = await fetch(`${ZAMMAD_URL}/api/v1/users`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", Authorization: ZAMMAD_TOKEN },
//     });
//     const responseAsJson = await response.json();
//     const dataUrl = responseAsJson.data.generateUrl;

//     return res.status(200).send({ ok: true, data: { url: dataUrl } });
//   } catch (error) {
//     capture(error);
//     res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
//   }
// });

// Get the list of tickets stats
router.get("/ticket_overviews", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    // const response = await zammad.api("/ticket_overviews", { method: "GET", headers: { "X-On-Behalf-Of": email } });
    const response = await zammad.api("/ticket_overviews", { method: "GET" });
    console.log(response);
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get the list of tickets with their articles.
router.get("/ticket", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    const response = await zammad.api("/tickets", { method: "GET", headers: { "X-On-Behalf-Of": email } });
    const data = [];
    if (response.length) {
      for (const item of response) {
        const articles = await zammad.api("/ticket_articles/by_ticket/" + item.id, { method: "GET", headers: { "X-On-Behalf-Of": email } });
        data.push({ ...item, articles });
      }
    }
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get one tickets with its articles.
router.get("/ticket/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    const response = await zammad.api("/tickets/" + req.params.id, { method: "GET", headers: { "X-On-Behalf-Of": email } });
    const articles = await zammad.api("/ticket_articles/by_ticket/" + req.params.id, { method: "GET", headers: { "X-On-Behalf-Of": email } });
    const data = { ...response, articles };
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Update one ticket (add a response).
router.put("/ticket/:id", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  console.log("body", req.body);
  const { message, state } = req.body;
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });

    if (message) {
      const response = await zammad.api("/ticket_articles", {
        method: "PUT",
        headers: { "X-On-Behalf-Of": email },
        body: JSON.stringify({
          ticket_id: req.params.id,
          body: message,
          content_type: "text/html",
          type: "note",
          internal: false,
        }),
      });
      if (!response.id) return res.status(400).send({ ok: false });
      return res.status(200).send({ ok: true, data: response });
    } else if (state) {
      const response = await zammad.api(`/tickets/${req.params.id}`, {
        method: "PUT",
        headers: { "X-On-Behalf-Of": email },
        body: JSON.stringify({
          id: req.params.id,
          state
        }),
      });
      if (!response.id) return res.status(400).send({ ok: false });
      return res.status(200).send({ ok: true, data: response });
    }

  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Create a new ticket
router.post("/ticket", passport.authenticate(["referent", "young"], { session: false }), async (req, res) => {
  try {
    const { subject, type, message } = req.body;
    const email = req.user.email;

    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    const response = await zammad.api("/tickets", {
      headers: { "X-On-Behalf-Of": email },
      method: "POST",
      body: JSON.stringify({
        title: `${type} - ${subject}`,
        group: "Users",
        customer_id,
        customer: email,
        article: {
          subject,
          body: message,
          // type:'note',
          internal: false,
        },
      }),
    });
    if (!response.id) return res.status(400).send({ ok: false });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

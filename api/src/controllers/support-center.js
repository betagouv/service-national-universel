const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const zammad = require("../zammad");
const { ERRORS, isYoung } = require("../utils");
const { ZAMMAD_GROUP } = require("snu-lib/constants");
const { ticketStateIdByName } = require("snu-lib/zammad");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { APP_URL, ADMIN_URL } = require("../config");

async function checkStateTicket({ state_id, created_by_id, updated_by_id, id, email }) {
  if (state_id === ticketStateIdByName("fermé")) {
    const response = await zammad.api(`/tickets/${id}`, {
      method: "PUT",
      headers: { "X-On-Behalf-Of": email },
      body: JSON.stringify({
        id: id,
        state: "open",
      }),
    });
    if (!response.id) return { ok: false, response };
  } else if (state_id === ticketStateIdByName("nouveau") && created_by_id !== updated_by_id) {
    const response = await zammad.api(`/tickets/${id}`, {
      method: "PUT",
      headers: { "X-On-Behalf-Of": email },
      body: JSON.stringify({
        id: id,
        state: "open",
      }),
    });
    if (!response.id) return { ok: false, response };
  }
  return { ok: true };
}

// Get the list of tickets stats
router.get("/ticket_overviews", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    const response = await zammad.api("/ticket_overviews", { method: "GET" });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get the list of tickets (with their articles when withArticles query param is provided).
router.get("/ticket", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (isYoung(req.user)) {
      groupId = 4;
    } else {
      groupId = 5;
    }
    let response = await zammad.api("/tickets", { method: "GET", headers: { "X-On-Behalf-Of": email } });
    response = response?.filter((ticket) => ticket.group_id === groupId && ticket.created_by_id === customer_id);
    if (response.length && req.query.withArticles) {
      const data = [];
      for (const item of response) {
        const articles = await zammad.api("/ticket_articles/by_ticket/" + item.id, { method: "GET", headers: { "X-On-Behalf-Of": email } });
        data.push({ ...item, articles });
      }
      return res.status(200).send({ ok: true, data });
    }
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get one tickets with its articles.
router.get("/ticket/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
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
router.put("/ticket/:id", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  const { message, ticket, state } = req.body;
  try {
    const email = req.user.email;
    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (message) {
      const response = await zammad.api("/ticket_articles", {
        method: "POST",
        headers: { "X-On-Behalf-Of": email },
        body: JSON.stringify({
          ticket_id: req.params.id,
          body: message,
          content_type: "text/html",
          type: "note",
          internal: false,
        }),
      });

      if (!response.id) return res.status(400).send({ ok: false, data: response });

      const stateTicket = await checkStateTicket({
        id: req.params.id,
        state_id: ticket.state_id,
        created_by_id: ticket.created_by_id,
        updated_by_id: response.updated_by_id,
        email,
      });
      if (!stateTicket.ok) return res.status(400).send({ ok: false, data: stateTicket.response });

      if (stateTicket) return res.status(200).send({ ok: true, data: response });
    } else if (state) {
      const response = await zammad.api(`/tickets/${req.params.id}`, {
        method: "PUT",
        headers: { "X-On-Behalf-Of": email },
        body: JSON.stringify({
          id: req.params.id,
          state,
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
router.post("/ticket", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { subject, type, message, tags, title } = req.body;
    const email = req.user.email;

    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(401).send({ ok: false, code: ERRORS.NOT_FOUND });

    // default ?
    let group = "";
    if (req.body.group && ZAMMAD_GROUP.includes(req.body.group)) {
      group = req.body.group;
    } else if (isYoung(req.user)) {
      group = ZAMMAD_GROUP.YOUNG;
    } else {
      group = ZAMMAD_GROUP.REFERENT;
    }

    const ticketTitle = title || `${type} - ${subject}`;

    const response = await zammad.api("/tickets", {
      headers: { "X-On-Behalf-Of": email },
      method: "POST",
      body: JSON.stringify({
        title: `📝 ${ticketTitle}`,
        group,
        customer_id,
        customer: email,
        article: {
          subject,
          body: message,
          // type:'note',
          internal: false,
        },
        tags: tags ? tags.join(",") : "",
      }),
    });
    if (!response.id) return res.status(400).send({ ok: false });
    return res.status(200).send({ ok: true, data: response });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Search for tickets via tags
router.post("/ticket/search-by-tags", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const tags = encodeURIComponent(req.body.tags.map((tag) => `tags:${tag}`).join(" AND "));
    const response = await zammad.api(`/tickets/search?query=${tags}`, { method: "GET" });
    if (response?.assets?.Ticket && Object.values(response?.assets?.Ticket).length) {
      if (req.query.withArticles) {
        const data = [];
        for (const item of Object.values(response.assets.Ticket)) {
          const articles = await zammad.api("/ticket_articles/by_ticket/" + item.id, { method: "GET" });
          data.push({ ...item, articles });
        }
        return res.status(200).send({ ok: true, data });
      }
      return res.status(200).send({ ok: true, data: Object.values(response.assets.Ticket) });
    }
    return res.status(200).send({ ok: true, data: [] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

// Get the tags of one specific ticket
router.get("/ticket/:ticketId/tags", passport.authenticate(["referent"], { session: false }), async (req, res) => {
  try {
    const { error, value } = Joi.string().required().validate(req.params.ticketId);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
    const response = await zammad.api(`/tags?object=Ticket&o_id=${value}`, { method: "GET" });
    if (!response.tags) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }
    return res.status(200).send({ ok: true, tags: response.tags });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

router.post("/ticket/update", async (req, res) => {
  try {
    if (req["user-agent"] !== "Zammad User Agent") return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    const ticket = req.body.ticket;
    const article = req.body.article;
    if (!ticket) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (!article) return res.status(401).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (article.created_by.email !== ticket.created_by.email) {
      const webhookObject = {
        email: ticket.created_by.email,
        firstname: ticket.created_by.firstname,
        lastname: ticket.created_by.lastname,
        body: article.body
      };
      const { error, value } = Joi.object({ email: Joi.string().email().required(), body: Joi.string().required(), firstname: Joi.string().required(), lastname: Joi.string().required(), })
        .unknown()
        .validate(webhookObject);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const { email, firstname, lastname, body } = value;
      sendTemplate(SENDINBLUE_TEMPLATES.young.ANSWER_RECEIVED, {
        emailTo: [{ name: `${firstname} ${lastname}`, email }],
        params: {
          cta: ticket.created_by.role[0] === "Volontaire" ? `${APP_URL}/besoin-d-aide` : `${ADMIN_URL}/besoin-d-aide`,
          message: body,
        },
      });
    }
    return res.status(200).send({ ok: true, data: [] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

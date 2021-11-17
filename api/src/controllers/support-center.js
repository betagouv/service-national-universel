const express = require("express");
const router = express.Router();
const passport = require("passport");
const Joi = require("joi");

const { capture } = require("../sentry");
const zammad = require("../zammad");
const YoungObject = require("../models/young");
const ReferentModel = require("../models/referent");
const { ERRORS, isYoung } = require("../utils");
const { ZAMMAD_GROUP } = require("snu-lib/constants");
const { ticketStateIdByName } = require("snu-lib/zammad");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { APP_URL, ADMIN_URL, ZAMMAD_PLATEFORME_USER, ZAMMAD_PLATEFORME_USER_ID } = require("../config");
const { ROLES } = require("snu-lib/roles");
const zammadAuth = require("../middlewares/zammadAuth");

async function checkStateTicket({ state_id, created_by_id, updated_by_id, id, email }) {
  if (state_id === ticketStateIdByName("closed")) {
    const response = await zammad.api(`/tickets/${id}`, {
      method: "PUT",
      headers: { "X-On-Behalf-Of": email },
      body: JSON.stringify({
        id: id,
        state: "open",
      }),
    });
    if (!response.id) return { ok: false, response };
  } else if (state_id === ticketStateIdByName("new") && created_by_id !== updated_by_id) {
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
    if (!customer_id) return res.status(403).send({ ok: false, code: ERRORS.NOT_FOUND });
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
    if (!customer_id) return res.status(403).send({ ok: false, code: ERRORS.NOT_FOUND });
    if (isYoung(req.user)) {
      groupId = 4;
    } else {
      groupId = 5;
    }
    let response = await zammad.api(`/tickets/search?query=${email}`);
    if (!response || !response.assets || !response.assets.Ticket) return res.status(200).send({ ok: true, data: [] });
    response = Object.values(response?.assets?.Ticket).filter((ticket) => ticket.created_by_id === customer_id);
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
    if (!customer_id) return res.status(403).send({ ok: false, code: ERRORS.NOT_FOUND });
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
    if (!customer_id) return res.status(403).send({ ok: false, code: ERRORS.NOT_FOUND });
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

// Create a new ticket while authenticated
router.post("/ticket", passport.authenticate(["referent", "young"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const { subject, type, message, tags, title, } = req.body;
    const email = req.user.email;

    const customer_id = await zammad.getCustomerIdByEmail(email);
    if (!customer_id) return res.status(403).send({ ok: false, code: ERRORS.NOT_FOUND });

    // default ?
    let group = "";
    if (req.body.group && ZAMMAD_GROUP.includes(req.body.group)) {
      group = req.body.group;
    } else if (isYoung(req.user)) {
      group = ZAMMAD_GROUP.VOLONTAIRE;
    } else if (req.user.role === ROLES.REFERENT_DEPARTMENT || req.user.role === ROLES.REFERENT_REGION) {
      group = ZAMMAD_GROUP.REFERENT;
    } else if (req.user.role === ROLES.ADMIN) {
      group = ZAMMAD_GROUP.ADMIN;
    } else if (req.user.role === ROLES.RESPONSIBLE || req.user.role === ROLES.SUPERVISOR) {
      group = ZAMMAD_GROUP.STRUCTURE;
    } else {
      group = ZAMMAD_GROUP.CONTACT;
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

// Create a new ticket while non-authenticated
router.post("/public/ticket", async (req, res) => {
  try {
    const ticketObject = {
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      title: req.body.title,
      name: req.body.name,
    };
    const { error, value } = Joi.object({
      email: Joi.string().email().required(),
      subject: Joi.string().required(),
      message: Joi.string().required(),
      title: Joi.string().required(),
      name: Joi.string().required(),
    })
      .unknown()
      .validate(ticketObject);
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    const { subject, message, title, name, email } = value;
    const group = req.user ? ZAMMAD_GROUP.YOUNG : ZAMMAD_GROUP.CONTACT;

    const response = await zammad.api("/tickets", {
      headers: { "X-On-Behalf-Of": ZAMMAD_PLATEFORME_USER },
      method: "POST",
      body: JSON.stringify({
        title: `🔍 ${title}`,
        group,
        customer_id: ZAMMAD_PLATEFORME_USER_ID,
        customer: ZAMMAD_PLATEFORME_USER,
        article: {
          subject,
          body: `- Nom et prénom : ${name}\n- Email : ${email}\n\n${message}`,
          // type:'note',
          internal: false,
        },
        tags: req.body.tags ? req.body.tags.join(",") : "",
      }),
    });
    if (!response.id) return res.status(400).send({ ok: false, message: response });
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

router.post("/ticket/update", zammadAuth, async (req, res) => {
  try {
    const ticket = req.body.ticket;
    const article = req.body.article;
    if (!ticket) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (!article) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    if (article.created_by.email !== ticket.created_by.email) {
      const webhookObject = {
        email: ticket.created_by.email,
        firstname: ticket.created_by.firstname,
        lastname: ticket.created_by.lastname,
        body: article.body,
      };
      const { error, value } = Joi.object({
        email: Joi.string().email().required(),
        body: Joi.string().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
      })
        .unknown()
        .validate(webhookObject);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      const { email, firstname, lastname, body } = value;
      const cta = ticket?.created_by?.roles?.includes("Volontaire") ? `${APP_URL}/besoin-d-aide` : `${ADMIN_URL}/besoin-d-aide`;
      sendTemplate(SENDINBLUE_TEMPLATES.young.ANSWER_RECEIVED, {
        emailTo: [{ name: `${firstname} ${lastname}`, email }],
        params: {
          cta,
          message: body,
        },
      });
    }
    if (req.headers['x-zammad-trigger'] === "REFERENTS notification") {
      const young = await YoungObject.findOne({ email: ticket.created_by.email });
      const user = await ReferentObject.findOne({ email: ticket.created_by.email });
      if (!young && !user) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      console.log("TICKET CREATOR", young || user);

      const { error, value } = Joi.string().required().validate(article.body);
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS, error: error.message });
      console.log("TICKET BODY", value);

      const department = young.department || user.department;
      const region = young.region || user.region;
      console.log("TICKET CREATOR LOCATION", department, region);

      const regionReferents = await ReferentObject.find({
        role: "referent_region",
        region
      });
      console.log("REGION REFERENTS", regionReferents);
      const departmentReferents = await ReferentObject.find({
        role: "referent_department",
        department
      });
      console.log("DEPARTMENT REFERENTS", departmentReferents);

      for (let referent of regionReferents) {
        console.log("REGION REFERENTS LOOP", referent.lastName);
        sendTemplate(SENDINBLUE_TEMPLATES.referent.MESSAGE_NOTIFICATION, {
          emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: "chloe@selego.co" }],
          params: {
            cta: `${ADMIN_URL}/boite-de-reception`,
            message: value,
            from: young ? `${young.firstName} ${young.lastName}` : `${user.firstName} ${user.lastName}`,
          },
        });
      }
      for (let referent of departmentReferents) {
        console.log("DEPARTMENT REFERENTS LOOP", referent.lastName);
        sendTemplate(SENDINBLUE_TEMPLATES.referent.MESSAGE_NOTIFICATION, {
          emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: "chloe@selego.co" }],
          params: {
            cta: `${ADMIN_URL}/boite-de-reception`,
            message: value,
            from: young ? `${young.firstName} ${young.lastName}` : `${user.firstName} ${user.lastName}`,
          },
        });
      }
    }
    return res.status(200).send({ ok: true, data: [] });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR, error });
  }
});

module.exports = router;

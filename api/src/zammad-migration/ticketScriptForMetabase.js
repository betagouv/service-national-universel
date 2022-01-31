require("dotenv").config({ path: "../../.env-prod" });
require("../mongo");
const client = require("./database");
const YoungModel = require("../models/young");
const ReferentModel = require("../models/referent");
const TicketModel = require("../models/ticket");
const TagModel = require("../models/tag");
const { intervalToDuration, formatDuration } = require("date-fns");
const { fr } = require("date-fns/locale");
const { ENVIRONMENT } = require("../config");

// function call, because eslint is yelling
const migrateTickets = async ({ force } = { force: false }) => {
  console.log("MONGO", process.env.MONGO_URL);
  if (ENVIRONMENT !== "production" && !force) return console.log("no migration zammad");
  // Mes étapes
  // 1. Récupérer les différentes tables et les filtrer pour récupérer les champs intéressants
  const tickets = (await client("SELECT * from tickets")).rows;
  const ticketArticles = (await client("SELECT * from ticket_articles")).rows;
  const ticketStates = (await client("SELECT * from ticket_states")).rows;
  const ticketPriorities = (await client("SELECT * from ticket_priorities")).rows;
  const ticketArticleTypes = (await client("SELECT * from ticket_article_types")).rows;
  const ticketArticleSenders = (await client("SELECT * from ticket_article_senders")).rows;
  const ticketTags = (await client("SELECT * from tags")).rows;
  const tagItems = (await client("SELECT * from tag_items")).rows;
  const groups = (await client("SELECT * from groups")).rows;
  const users = (await client("SELECT * from users")).rows;

  function findZammadUser(id) {
    return users.filter((user) => id === user.id)[0];
  }

  try {
    // 2. Créer / mettre à jour ma table Tag avec toutes les occurences
    for (let tag of tagItems) {
      const tagExisting = await TagModel.findOne({ zammadId: tag.id });
      if (tagExisting) {
        //console.log("TAG ALREADY EXISTS !");
        if (tagExisting.name !== tag.name) {
          await tagExisting.save({ name: tag.name });
        }
        continue;
      }
      const SNUtag = await TagModel.create({ zammadId: tag.id, name: tag.name });
      //console.log("TAG CREATED", SNUtag);
    }

    for (let ticket of tickets) {
      console.log("-------------------------");
      let priority = await ticketPriorities.filter((priority) => ticket.priority_id === priority.id)[0].name;
      if (priority === "1 low") priority = "LOW";
      if (priority === "2 normal") priority = "NORMAL";
      if (priority === "3 high") priority = "HIGH";
      // 4. Checker via l'adresse mail si l'émetteur existe dans notre DB
      // 5. S'il existe : récupérer son rôle, son département et sa région
      // 6. S'il n'existe pas : stocker son Zammad id et passer emitterExternal à true
      let emitterUser;
      let emitterExternal = false;
      const emitterYoung = await YoungModel.findOne({ email: findZammadUser(ticket.created_by_id).email });
      if (!emitterYoung) {
        emitterUser = await ReferentModel.findOne({ email: findZammadUser(ticket.created_by_id).email });
      } else if (!emitterUser) {
        emitterExternal = true;
      }
      let agentInChargeId = await ReferentModel.findOne({ email: findZammadUser(ticket.owner_id).email })?._id;
      if (!agentInChargeId) agentInChargeId = null;

      let messagesArray = [];
      const messages = await ticketArticles.filter((article) => ticket.id === article.ticket_id);
      for (let message of messages) {
        const creatorYoung = await YoungModel.findOne({ email: findZammadUser(message.created_by_id).email });
        let creatorUser;
        if (!creatorYoung) {
          creatorUser = await ReferentModel.findOne({ email: findZammadUser(message.created_by_id).email });
        }
        messagesArray.push({
          zammadId: message.id,
          body: message.body,
          type: ticketArticleTypes.filter((type) => message.type_id === type.id)[0].name,
          emitterSNURole: creatorUser?.role || "",
          emitterZammadRole: ticketArticleSenders.filter((sender) => message.sender_id === sender.id)[0].name,
          createdByUserId: creatorUser?._id || null,
          createdByYoungId: creatorYoung?._id || null,
          createdByZammadId: message.created_by_id,
          contentType: message.content_type,
          internal: message.internal,
          createdAt: message.created_at,
          updatedAt: message.updated_at,
        });
      }
      // As we can't use the firstResponseAt from Zammad's ticket object, we have to do this instead :
      //const firstResponseAt = messages[1]?.created_at;
      const firstResponseAt = messages.filter((m) => m.created_by_id !== ticket.created_by_id)[0]?.created_at;
      //console.log("FIRST RESPONSE AT", firstResponseAt);
      let timeUntilFirstResponse;
      if (firstResponseAt) {
        const duration = intervalToDuration({ start: ticket.created_at, end: firstResponseAt });
        timeUntilFirstResponse = formatDuration(duration, { zero: false, locale: fr });
        //console.log("TIME UNTIL FIRST RESPONSE ---->", timeUntilFirstResponse);
      }

      const tags = ticketTags.filter((tag) => tag.o_id === ticket.id);
      let tagsIds = [];
      let addressedToAgent = [];
      let fromCanal = "";
      let category = "";
      let subject = "";
      let department = "";
      let region = "";
      let cohort = "";
      let emitter = "";
      let feedback = "";
      let tagNames = [];
      for (let tag of tags) {
        const tagName = await tagItems.filter((item) => item.id === tag.tag_item_id)[0].name;
        if (tagName.includes("AGENT")) {
          addressedToAgent.push(tagName);
        } else if (tagName.includes("CANAL")) {
          fromCanal = tagName;
        } else if (tagName.includes("problème_technique") || tagName.includes("question")) {
          tagName.includes("question") ? (category = "QUESTION") : (category = "TECHNICAL");
        } else if (tagName.includes("DEPARTEMENT")) {
          department = tagName.split("DEPARTEMENT_")[1];
        } else if (tagName.includes("REGION")) {
          region = tagName.split("REGION_")[1];
        } else if (tagName.includes("merci") || tagName.includes("WOW") || tagName.includes("mécontent")) {
          feedback = tagName;
        } else if (tagName.includes("COHORTE")) {
          cohort = tagName.split("COHORTE_")[1];
        } else if (tagName.includes("EMETTEUR")) {
          emitter = tagName.split("EMETTEUR_")[1];
        } else if (tagName.includes("TAG")) {
          subject = tagName.split("TAG_")[1];
        } else {
          // 3. Récupérer les ids des tags du ticket dans la table Tag
          const tagId = await TagModel.findOne({ zammadId: tag.tag_item_id });
          if (!tagId) continue;
          tagsIds.push({ id: tagId.zammadId, name: tagName });
          tagNames.push(tagName);
          console.log("TAGS", tagNames);
        }
      }
      // 7. Rassembler toutes les données et créer un nouveau document dans ma table Ticket ou update un document existant
      const ticketBody = {
        zammadId: ticket.id,
        number: ticket.number,
        title: ticket.title,
        category,
        subject,
        emitter,
        cohort,
        emitterUserId: emitterUser?._id || null,
        emitterYoungId: emitterYoung?._id || null,
        emitterZammadId: ticket.created_by_id,
        emitterExternal,
        emitterDepartment: department || emitterUser?.department || emitterYoung?.department || "",
        emitterRegion: region || emitterUser?.region || emitterYoung?.region || "",
        addressedToAgent,
        fromCanal,
        group: groups.filter((group) => ticket.group_id === group.id)[0].name,
        priority,
        status: ticketStates.filter((state) => ticket.state_id === state.id)[0].name,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        closedAt: ticket.close_at,
        firstResponseAt,
        timeUntilFirstResponse,
        lastContactEmitterAt: ticket.last_contact_customer_at,
        lastContactAgentAt: ticket.last_contact_agent_at,
        feedback: feedback || "neutre",
        tagIds: tagsIds,
        tagName1: tagNames[0] || null,
        tagName2: tagNames[1] || null,
        tagName3: tagNames[2] || null,
        tagName4: tagNames[3] || null,
        messages: messagesArray,
        agentInChargeId,
        agentInChargeZammadId: ticket.owner_id,
        lastAgentInChargeUpdateAt: ticket.last_owner_update_at,
        lastUpdateById: ticket.updated_by_id,
      };
      //console.log("TICKET BODY OKAY ?", ticketBody);
      const ticketExisting = await TicketModel.findOne({ zammadId: ticket.id });
      if (ticketExisting) {
        console.log("TICKET EXISTING !");
        ticketExisting.set(ticketBody);
        const ticketSaved = await ticketExisting.save();
        console.log("TICKET ----->", ticketSaved?.title);
      } else {
        const ticketCreated = await TicketModel.create(ticketBody);
        console.log("TICKET CREATED", ticketCreated?.title);
        if (!ticketCreated) {
          console.log("ERROR IN TICKET CREATION");
        }
      }
    }
  } catch (error) {
    console.log("ERROR !", error);
  }
  console.log("END OF SCRIPT.");
};

migrateTickets();

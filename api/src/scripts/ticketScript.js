const dataMapper = require("../dataMapper/dataMapper");
const YoungModel = require("../models/young");
const ReferentModel = require("../models/referent");
const TicketModel = require("../models/ticket");
const TagModel = require("../models/tag");

(async () => {
  console.log("AM I HERE ???");
  //? Mes étapes
  // 1. Récupérer les différentes tables et les filtrer pour récupérer les champs intéressants
  const tickets = await dataMapper.getAllTickets();
  const ticketArticles = await dataMapper.getAllTicketArticles();
  const ticketStates = await dataMapper.getAllTicketStates();
  const ticketPriorities = await dataMapper.getAllTicketPriorities();
  const ticketArticleTypes = await dataMapper.getAllTicketArticleTypes();
  const ticketArticleSenders = await dataMapper.getAllTicketArticleSenders();
  const ticketTags = await dataMapper.getAllTags();
  const tagItems = await dataMapper.getAllTagItems();
  const groups = await dataMapper.getAllGroups();
  const users = await dataMapper.getAllUsers();
  console.log("TAGS", tagItems);

  // 2. Créer / mettre à jour ma table Tag avec toutes les occurences
  for (let tag of tagItems) {
    const tagExisting = await TagModel.findOne({ zammadId: tag.id });
    if (tagExisting) {
      if (tagExisting.name !== tag.name) {
        await tagExisting.save({ name: tag.name });
      } return;
    };
    const SNUtag = await TagModel.create({ zammadId: tag.id, name: tag.name });
    console.log("TAG CREATED", SNUtag);
  }

  let ticketsArray = [];
  for (let ticket of tickets) {
    // 4. Checker via l'adresse mail si l'émetteur existe dans notre DB
    // 5. S'il existe : récupérer son rôle, son département et sa région
    // 6. S'il n'existe pas : stocker son Zammad id et passer emitterExternal à true
    function findZammadUser(id) {
      return users.filter((user) => id === user.id)[0];
    };
    let emitterUser;
    let emitterExternal = false;
    const emitterYoung = await YoungModel.findOne({ email: findZammadUser(ticket.created_by_id).email });
    if (!emitterYoung) {
      emitterUser = await ReferentModel.findOne({ email: findZammadUser(ticket.created_by_id).email });
    } else if (!emitterUser) {
      emitterExternal = true;
    }
    let agentInChargeId = await ReferentModel.findOne({ email: findZammadUser(ticket.owner_id).email })?._id;
    if (!agentInChargeId) agentInChargeId = ticket.owner_id;

    let messagesArray = [];
    const messages = ticketArticles.filter((article) => ticket.id === article.ticket_id);
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
        emitterSNURole: creatorUser.role || "",
        emitterZammadRole: ticketArticleSenders.filter((sender) => message.sender_id === sender.id)[0].name,
        createdByUserId: creatorUser._id || "",
        createdByYoungId: creatorYoung._id || "",
        createdByZammadId: message.created_by_id,
        contentType: message.content_type,
        internal: message.internal,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
      });
    }

    const tags = ticketTags.filter((tag) => tag.o_id === ticket.id);
    let tagsIds = [];
    let addressedToAgents = [];
    let fromCanal = "";
    let category = "";
    let department = "";
    let region = "";
    for (let tag of tags) {
      const tagName = tagItems.filter((item) => item.id === tag.tag_item_id)[0].name;
      if (tagName.includes("AGENT")) {
        addressedToAgents.push(tagName);
      } else if (tagName.includes("CANAL")) {
        fromCanal = tagName;
      } else if (tagName.includes("TECHNICAL") || tagName.includes("QUESTION")) {
        category = tagName;
      } else if (tagName.includes("DEPARTEMENT")) {
        department = tagName;
      } else if (tagName.includes("REGION")) {
        region = tagName;
      } else {
        // 3. Récupérer les ids des tags du ticket dans la table Tag
        const tagId = await TagModel.findOne({ zammadId: tag_item_id });
        tagsIds.push(tagId.zammadId);
      }
    }

    // 7. Rassembler toutes les données et créer une nouvelle occurence dans ma table Ticket
    ticketsArray.push({
      zammadId: ticket.id,
      number: ticket.number,
      title: ticket.title,
      category,
      subject,
      emitterUserId: emitterUser._id,
      emitterYoungId: emitterYoung._id,
      emitterZammadId: ticket.created_by_id,
      emitterExternal,
      emitterDepartment: department || emitterUser.department || emitterYoung.department || "",
      emitterRegion: region || emitterUser.region || emitterYoung.region || "",
      addressedToAgents,
      fromCanal,
      group: groups.filter((group) => ticket.group_id === group.id)[0].name,
      priority: ticketPriorities.filter((priority) => ticket.priority_id === priority.id)[0].name,
      state: ticketStates.filter((state) => ticket.state_id === state.id)[0].name,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      closedAt: "",
      firstResponseAt: ticket.first_response_at,
      lastContactEmitterAt: ticket.last_contact_customer_at,
      lastContactAgentAt: ticket.last_contact_agent_at,
      tagIds: [],
      tags: tagsArray,
      messages: messagesArray,
      agentInChargeId,
      lastAgentInChargeUpdateAt: ticket.last_owner_update_at,
      lastUpdateById: ticket.updated_by_id,
    });
  }
  console.log(tickets.length);
});

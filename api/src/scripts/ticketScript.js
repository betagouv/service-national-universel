const dataMapper = require("../dataMapper/dataMapper");

(async () => {
  const tickets = await dataMapper.getAllTickets();
  const ticketArticles = await dataMapper.getAllTicketArticles();
  const ticketStates = await dataMapper.getAllTicketStates();
  const ticketPriorities = await dataMapper.getAllTicketPriorities();
  const ticketArticleTypes = await dataMapper.getAllTicketArticleTypes();
  const ticketArticleSenders = await dataMapper.getAllTicketArticleSenders();
  const ticketTags = await dataMapper.getAllTags();
  const tagItems = await dataMapper.getAllTagItems();
  const groups = await dataMapper.getAllGroups();

  let ticketsArray = [];
  for (let ticket of tickets) {
    let messagesArray = [];
    const messages = ticketArticles.filter((article) => ticket.id === article.ticket_id);
    for (let message of messages) {
      messagesArray.push({
        body: message.body,
        type: ticketArticleTypes.filter((type) => message.type_id === type.id)[0].name,
        emitterRole: ticketArticleSenders.filter((sender) => message.sender_id === sender.id)[0].name,
        createdByUserId: message.created_by_id,
        contentType: message.content_type,
        internal: message.internal,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
      });
    }
    const state = ticketStates.filter((state) => ticket.state_id === state.id);
    const priority = ticketPriorities.filter((priority) => ticket.priority_id === priority.id);
    const group = groups.filter((group) => ticket.group_id === group.id);
    const tags = ticketTags.filter((tag) => tag.o_id === ticket.id);
    let tagsArray = [];
    let addressedToAgents = [];
    let fromCanal = "";
    let category = "";
    let subject = "";
    for (let tag of tags) {
      const tagName = tagItems.filter((item) => item.id === tag.tag_item_id)[0].name;
      tagsArray.push(tagName);
      if (tagName.includes("AGENT")) {
        addressedToAgents.push(tagName);
      } else if (tagName.includes("CANAL")) {
        fromCanal = tagName;
      } else if (tagName.includes("TECHNICAL") || tagName.includes("QUESTION")) {
        category = tagName;
      } else {
        subject = tagName;
      }
    }

    ticketsArray.push({
      number: ticket.number,
      title: ticket.title,
      category,
      subject,
      emitterUserId: ticket.created_by_id,
      emitterYoungId: "",
      emitterExternal: !!ticket.created_by_id,
      addressedToAgents,
      fromCanal,
      group: group[0].name,
      priority: priority[0].name,
      state: state[0].name,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      closedAt: "",
      firstResponseAt: ticket.first_response_at,
      lastContactEmitterAt: ticket.last_contact_customer_at,
      lastContactAgentAt: ticket.last_contact_agent_at,
      tagIds: [],
      tags: tagsArray,
      messages: messagesArray,
      agentInChargeId: ticket.owner_id,
      lastAgentInChargeUpdateAt: ticket.last_owner_update_at,
      lastUpdateById: ticket.updated_by_id,
    });
    console.log("TICKETS", ticketsArray);
  }
  console.log(tickets.length);
})();

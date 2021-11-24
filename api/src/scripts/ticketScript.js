const express = require("express");

const dataMapper = require("../dataMapper/dataMapper");
const zammad = require("../zammad");
const { ERRORS, isYoung } = require("../utils");
const { ZAMMAD_GROUP } = require("snu-lib/constants");
const { ticketStateIdByName } = require("snu-lib/zammad");
const { sendTemplate } = require("../sendinblue");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { APP_URL, ADMIN_URL, ZAMMAD_PLATEFORME_USER, ZAMMAD_PLATEFORME_USER_ID } = require("../config");
const { ROLES } = require("snu-lib/roles");

(async () => {
  const tickets = await dataMapper.getAllTickets();
  const ticketArticles = await dataMapper.getAllTicketArticles();
  const ticketStates = await dataMapper.getAllTicketStates();
  const ticketPriorities = await dataMapper.getAllTicketPriorities();
  const ticketArticleTypes = await dataMapper.getAllTicketArticleTypes();
  const ticketArticleSenders = await dataMapper.getAllTicketArticleSenders();
  const tags = await dataMapper.getAllTags();
  const tagItems = await dataMapper.getAllTagItems();
  if (!tickets) {
    console.log("no data");
  }
  let ticketArray;
  for (let ticket of tickets) {
    let messagesArray = [];
    const messages = ticketArticles.filter((article) => ticket.id === article.ticket_id);
    for (let message of messages) {
      const type = ticketArticleTypes.filter((type) => message.type_id === type.id);
      const sender = ticketArticleSenders.filter((sender) => message.sender_id === sender.id);
      console.log("TYPE", type[0].name);
      messagesArray.push({ body: message.body, type: type[0].name, emitterRole: sender[0].name });
    }
    console.log("TICKET MESSAGES", messagesArray);
    const state = ticketStates.filter((state) => ticket.state_id === state.id);
    const priority = ticketPriorities.filter((priority) => ticket.priority_id === priority.id);
    const ticketTags = tags.filter((tag) => tag.o_id === ticket.id);
    let tagsArray = [];
    for (let tag of ticketTags) {
      //console.log("------- TAG LOOP -------");
      const tagItem = tagItems.filter((item) => item.id === tag.tag_item_id);
      //console.log("TAG ITEM ?", tagItem);
      tagsArray.push(tagItem[0].name);
    }
    console.log("MESSAGES", messages.length);
    console.log("STATE", state[0].name);
    console.log("PRIORITY", priority[0].name);
    //console.log("TAGS ?", ticketTags);
    console.log("TAGS", tagsArray);
  }
  console.log(tickets.length);
})();

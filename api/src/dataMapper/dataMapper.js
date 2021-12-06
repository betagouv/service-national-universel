const client = require('./database');

const dataMapper = {
  getAllTickets: async () => {
    try {
      const tickets = await client("SELECT * from tickets limit 5");
      return tickets.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticles: async () => {
    try {
      const articles = await client("SELECT * from ticket_articles limit 10");
      return articles.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketStates: async () => {
    try {
      const states = await client("SELECT * from ticket_states");
      return states.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketPriorities: async () => {
    try {
      const priorities = await client("SELECT * from ticket_priorities");
      return priorities.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticleTypes: async () => {
    try {
      const articleTypes = await client("SELECT * from ticket_article_types");
      return articleTypes.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticleSenders: async () => {
    try {
      const articleSenders = await client("SELECT * from ticket_article_senders");
      return articleSenders.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTags: async () => {
    try {
      const tags = await client("SELECT * from tags");
      return tags.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTagItems: async () => {
    try {
      const tagItems = await client("SELECT * from tag_items");
      return tagItems.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllGroups: async () => {
    try {
      const groups = await client("SELECT * from groups");
      return groups.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = dataMapper;

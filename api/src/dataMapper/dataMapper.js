const client = require('./database');

const dataMapper = {
  getAllTickets: async () => {
    try {
      const tickets = await client.query("SELECT * from tickets");
      return tickets.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticles: async () => {
    try {
      const articles = await client.query(
        // "SELECT q.title, a.body FROM knowledge_base_answer_translations q, knowledge_base_answer_translation_contents a WHERE q.answer_id = a.id"
        "SELECT * from ticket_articles"
      );
      return articles.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketStates: async () => {
    try {
      const states = await client.query("SELECT * from ticket_states");
      return states.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketPriorities: async () => {
    try {
      const priorities = await client.query("SELECT * from ticket_priorities");
      return priorities.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticleTypes: async () => {
    try {
      const articleTypes = await client.query("SELECT * from ticket_article_types");
      return articleTypes.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTicketArticleSenders: async () => {
    try {
      const articleSenders = await client.query("SELECT * from ticket_article_senders");
      return articleSenders.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTags: async () => {
    try {
      const tags = await client.query("SELECT * from tags");
      return tags.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTagItems: async () => {
    try {
      const tagItems = await client.query("SELECT * from tag_items");
      return tagItems.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllGroups: async () => {
    try {
      const groups = await client.query("SELECT * from groups");
      return groups.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = dataMapper;

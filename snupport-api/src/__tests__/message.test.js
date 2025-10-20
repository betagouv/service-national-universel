const MessageModel = require("../models/message");

describe("Message Model", () => {
  describe("Indexes", () => {
    it("should have an index on ticketId", () => {
      const indexes = MessageModel.schema.indexes();
      const ticketIdIndex = indexes.find((index) => {
        const fields = index[0];
        return fields.ticketId !== undefined;
      });
      
      expect(ticketIdIndex).toBeDefined();
      expect(ticketIdIndex[0].ticketId).toBe(1);
    });
  });
});


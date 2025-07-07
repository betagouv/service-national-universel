require("../mongo");
const ticketModel = require("../models/ticket");
const messageModel = require("../models/message");

(async function messageToTicket() {
  try {
    let tickets = await ticketModel.find({});
    let i = 0;
    for (let ticket of tickets) {
      let messages = await messageModel.find({ ticketId: ticket._id });
      for (let message of messages) {
        if (!ticket.textMessage?.includes(message.text)) {
          ticket.textMessage.push(message.text);
        }
      }
      await ticket.save();
      if (i % 100 === 0) {
        console.log("index", i);
      }
      i++;
    }
    console.log("index", i);
    console.log(tickets.length);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
})();

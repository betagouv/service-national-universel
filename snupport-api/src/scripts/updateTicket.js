require("../mongo");

const TicketModel = require("../models/ticket");

(async () => {
  try {
    let i = 0;
    for await (let ticket of TicketModel.find({}).cursor()) {
      if (ticket.foldersId.length) {
        ticket.foldersId = [...new Set([...ticket.foldersId])];
        await ticket.save();
      }
      if (i % 100 === 0) console.log(i, ticket._id);
      i++;
    }

    console.log("DONE");
    process.exit(0);
  } catch (e) {
    console.log("e", e);
  }
})();

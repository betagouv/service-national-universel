require("../mongo");

const TicketModel = require("../models/ticket");
const TagModel = require("../models/tag");

(async () => {
  try {
    let i = 0;
    let tags = await TagModel.find();
    tags = tags.filter((tag) => tag);
    console.log(tags);

    for await (let ticket of TicketModel.find({}).cursor()) {
      if (i < 11700) {
        if (i % 100 === 0) console.log(i, ticket._id);
        i++;
        continue;
      }
      if (ticket.tags?.length > 0) {
        for (const tag of ticket.tags) {
          const tagFound = tags.find((t) => t.name === tag);
          if (!tagFound) continue;
          if (!ticket.tagsId.includes(tag)) ticket.tagsId.push(tagFound._id);
        }
        await ticket.save();
      }
      if (i % 100 === 0) {
        console.log(i, ticket._id);
      }
      i++;
    }

    console.log("DONE");
  } catch (e) {
    console.log("e", e);
  }
})();

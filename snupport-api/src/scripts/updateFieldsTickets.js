require("../mongo");

const TicketModel = require("../models/ticket");
const { weekday } = require("../utils");

(async () => {
  try {
    let i = 0;
    for await (let ticket of TicketModel.find({}).cursor()) {
      if (i < 3500) {
        if (i % 100 === 0) console.log(i, ticket._id);
        i++;
        continue;
      }
      if (!ticket.contactRegion || !ticket.contactDepartment) {
        if (ticket.contactAttributes.find((attr) => attr.name === "region")) {
          ticket.contactRegion = ticket.contactAttributes.find((attr) => attr.name === "region").value;
        }
        if (ticket.contactAttributes.find((attr) => attr.name === "departement")) {
          ticket.contactDepartment = ticket.contactAttributes.find((attr) => attr.name === "departement").value;
        }
        if (ticket.contactAttributes.find((attr) => attr.name === "cohorte")) {
          ticket.contactCohort = ticket.contactAttributes.find((attr) => attr.name === "cohorte").value;
        }
      }
      if (ticket.createdAt) {
        ticket.createdHourAt = ticket.createdAt.getHours();
        ticket.createdDayAt = weekday[new Date().getDay()];
      }
      if (ticket.contactAttributes.find((attr) => attr.name === "cohorte")) {
        ticket.contactCohort = ticket.contactAttributes.find((attr) => attr.name === "cohorte").value;
      }
      if (ticket.closedTime) {
        if (ticket.closedTime.includes("<")) ticket.closedTime = 0;
        else {
          console.log(ticket.closedTime);
          let t = Number(ticket.closedTime);
          ticket.closedTime = t.toFixed(2);
        }
      }
      await ticket.save();
      if (i % 100 === 0) console.log(i, ticket._id);
      i++;
    }

    console.log("DONE");
  } catch (e) {
    console.log("e", e);
  }
})();

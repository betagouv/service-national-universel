require("../mongo");

const { capture } = require("../sentry");
const slack = require("../slack");

const TicketModel = require("../models/ticket");
const AgentModel = require("../models/agent");
const { sendReferentReport, SENDINBLUE_TEMPLATES } = require("../utils");

const getDateString = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

async function fetchAllClosedTickets() {
  let endDate = new Date(getDateString(new Date()));

  let startDate = new Date();
  startDate.setDate(endDate.getDate() - 7);
  startDate = new Date(getDateString(startDate));

  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  try {
    const tickets = await TicketModel.find({
      status: "CLOSED",
      closedAt: { $gte: startDate, $lte: endDate },
    });

    return tickets;
  } catch (e) {
    capture(e);
    throw e;
  }
}

async function fetchAllOtherTickets() {
  try {
    const tickets = await TicketModel.find({
      status: { $ne: "CLOSED" },
    });

    return tickets;
  } catch (e) {
    capture(e);
    throw e;
  }
}

exports.handler = async () => {
  try {
    const tickets = await fetchAllClosedTickets();
    const otherTickets = await fetchAllOtherTickets();

    const referents = await AgentModel.find({ role: "REFERENT_DEPARTMENT" }, { departments: 1, _id: 0 });
    const allRefDepartments = referents.flatMap((referent) => referent.departments);
    const allRefUniqueDepartments = new Set(allRefDepartments);

    let mailCount = 0;
    let totalDepartment = 0;
    for (let department of allRefUniqueDepartments) {
      const referents = await AgentModel.find({
        role: "REFERENT_DEPARTMENT",
        departments: { $in: [department] },
      });

      const departmentTickets = tickets.filter((ticket) => ticket.contactDepartment === department);
      const departmentOtherTickets = otherTickets.filter((ticket) => ticket.contactDepartment === department);
      const ticketNew = departmentOtherTickets.filter((ticket) => ticket.status === "NEW");
      const ticketOpen = departmentOtherTickets.filter((ticket) => ticket.status === "OPEN");
      const ticketPending = departmentOtherTickets.filter((ticket) => ticket.status === "PENDING");
      const ticketDepartment = departmentTickets.filter((ticket) => ticket.status === "CLOSED" && (ticket.referentDepartmentId || ticket.referentRegionId));

      let averageClosedTimeHoursDepartment;
      const ticketSnupport = departmentTickets.filter((ticket) => ticket.status === "CLOSED" && !ticket.referentDepartmentId && !ticket.referentRegionId);

      let averageClosedTimeHoursSnupport;
      let validClosedTimeTicketsDepartment = ticketDepartment.filter((ticket) => typeof ticket.closedTimeHours === "number");
      if (validClosedTimeTicketsDepartment.length > 0) {
        averageClosedTimeHoursDepartment = parseFloat(
          (validClosedTimeTicketsDepartment.reduce((acc, ticket) => acc + ticket.closedTimeHours, 0) / validClosedTimeTicketsDepartment.length).toFixed(2)
        );
      }
      let validClosedTimeTicketsSnupport = ticketSnupport.filter((ticket) => typeof ticket.closedTimeHours === "number");
      if (validClosedTimeTicketsSnupport.length > 0) {
        averageClosedTimeHoursSnupport = parseFloat(
          (validClosedTimeTicketsSnupport.reduce((acc, ticket) => acc + ticket.closedTimeHours, 0) / validClosedTimeTicketsSnupport.length).toFixed(2)
        );
      }

      const infos = {
        department,
        ticketNew: ticketNew.length,
        ticketOpen: ticketOpen.length,
        ticketPending: ticketPending.length,
        ticketDepartment: ticketDepartment.length,
        ticketSnupport: ticketSnupport.length,
        timeToCloseReferent: averageClosedTimeHoursDepartment?.toString() || 0,
        timeToCloseSupport: averageClosedTimeHoursSnupport?.toString() || 0,
        refEmails: referents.map((ref) => ref.email),
      };

      if (infos.ticketNew === 0 && infos.ticketOpen === 0 && infos.ticketPending === 0 && infos.ticketDepartment === 0 && infos.ticketSnupport === 0) {
        console.log(`No ticket for this department: ${department}`);
        continue;
      }
      mailCount += infos.refEmails.length;
      totalDepartment += 1;
      await sendReferentReport(infos, SENDINBLUE_TEMPLATES.TICKET_REPORT);
    }

    await slack.info({
      title: `✅ Ticket Report`,
      text: `${mailCount} reports were sent to the referents from  ${totalDepartment} departments`,
    });
  } catch (e) {
    slack.error({ title: "❌ Send Ticket Report", text: e });
    capture(e);
  }
};

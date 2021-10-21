const ticketStates = {
  1: "nouveau",
  2: "ouvert",
  3: "rappel en attente",
  4: "fermé",
  7: "clôture en attente",
};

const ticketStateNameById = (id) => ticketStates[id];
const ticketStateIdByName = (name) =>
  Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name]
  );
const totalOpenedTickets = (tickets) => tickets?.filter((ticket) => ticket?.state_id === ticketStateIdByName("ouvert"))?.length;
const totalNewTickets = (tickets) => tickets?.filter((ticket) => ticket?.state_id === ticketStateIdByName("nouveau"))?.length;
const totalClosedTickets = (tickets) => tickets?.filter((ticket) => ticket?.state_id === ticketStateIdByName("fermé"))?.length;

module.exports = {
  ticketStateNameById,
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
};

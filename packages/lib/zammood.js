const ticketStates = {
  1: "new",
  2: "open",
  3: "pending reminder",
  4: "closed",
  7: "pending closure",
};

const ticketStateNameById = (id) => ticketStates[id];
const ticketStateIdByName = (name) => {
  return Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name],
  );
};
const totalOpenedTickets = (tickets) => {
  const openTicketsBucket = tickets.find((group) => group._id === "OPEN")
  return openTicketsBucket?.total || 0
};
const totalNewTickets = (tickets) => {
  const newTicketsBucket = tickets.find((group) => group._id === "NEW")
  return newTicketsBucket?.total || 0
};
const totalClosedTickets = (tickets) => {
  const closedTicketsBucket = tickets.find((group) => group._id === "CLOSED")
  return closedTicketsBucket?.total || 0
};

export {
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
  ticketStateNameById,
};

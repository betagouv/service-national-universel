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
    }, {})[name]
  );
};
const totalOpenedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("open")
  ).length;
};
const totalNewTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("new")
  ).length;
};
const totalClosedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("closed")
  ).length;
};

module.exports = {
  ticketStateNameById,
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
};

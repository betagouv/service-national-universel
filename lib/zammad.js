const { translateState } = require("./translation");

const ticketStates = {
  1: "new",
  2: "open",
  3: "pending reminder",
  4: "closed",
  7: "pending closure",
};

const ticketStateNameById = (id) => translateState(ticketStates[id]);
const ticketStateIdByName = (name) => {
  return Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[translateState(name)]
  );
};
const totalOpenedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("ouvert")
  ).length;
};
const totalNewTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("nouveau")
  ).length;
};
const totalClosedTickets = (tickets) => {
  return (tickets || []).filter(
    (ticket) => (ticket || {}).state_id === ticketStateIdByName("fermé")
  ).length;
};

module.exports = {
  ticketStateNameById,
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
};

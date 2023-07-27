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
  return (tickets || []).find((group) => group._id === "OPEN")?.total || 0;
};
const totalNewTickets = (tickets) => {
  return (tickets || []).find((group) => group._id === "NEW")?.total || 0;
};
const totalClosedTickets = (tickets) => {
  return (tickets || []).find((group) => group._id === "CLOSED")?.total || 0;
};

export {
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
  ticketStateNameById,
};

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

const weekendRanges = [
  { start: new Date("2024-12-29"), end: new Date("2024-12-31") },
  { start: new Date("2024-12-19"), end: new Date("2024-12-22") },

  // Ajoutez d'autres plages si nécessaire
];

function isDateInRange(newDate, ranges) {
  return ranges.some(({ start, end }) => newDate >= start && newDate <= end);
}

export {
  ticketStateIdByName,
  totalOpenedTickets,
  totalNewTickets,
  totalClosedTickets,
  ticketStateNameById,
  weekendRanges,
  isDateInRange,
};

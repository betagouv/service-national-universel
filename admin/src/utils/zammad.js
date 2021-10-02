const ticketStates = {
  1: "nouveau",
  2: "ouvert",
  3: "rappel en attente",
  4: "fermé",
  7: "clôture en attente",
};

export const ticketStateNameById = (id) => ticketStates[id];
export const ticketStateIdByName = (name) =>
  Number(
    Object.keys(ticketStates).reduce((ret, key) => {
      ret[ticketStates[key]] = key;
      return ret;
    }, {})[name]
  );

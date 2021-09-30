const translateState = (state_id) => {
  let state = "";
  if (state_id === 1) {
    state = "nouveau";
  } else if (state_id === 2) {
    state = "ouvert";
  } else if (state_id === 3) {
    state = "rappel en attente";
  } else if (state_id === 4) {
    state = "fermé";
  } else if (state_id === 7) {
    state = "clôture en attente";
  }
  return state;
};

export default translateState;

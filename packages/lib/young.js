import { YOUNG_SOURCE } from "./constants";

const isCle = (young) => {
  return young.source === YOUNG_SOURCE.CLE;
};

export { isCle };

export default { isCle };
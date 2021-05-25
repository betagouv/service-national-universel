require("dotenv").config({ path: "./../../.env-staging" });

require("../mongo");
const { capture, captureMessage } = require("../sentry");
const YoungModel = require("../models/young");
const { assignNextYoungFromWaitingList } = require("../utils");

const delay = 48; // delay in hour
const delayDate = new Date(Date.now() - 60 * 60 * 1000 * delay);

const clean = async () => {
  const youngsLimit = await YoungModel.find({ autoAffectationPhase1ExpiresAt: { $lte: delayDate } });
  console.log(`${youngsLimit.length} youngs has autoAffectationPhase1ExpiresAt > 48h`);
  for (let i = 0; i < youngsLimit.length; i++) {
    const young = youngsLimit[i];
    if (young.statusPhase1 === "WAITING_ACCEPTATION") {
      console.log(`${young._id} ${young.firstName} ${young.lastName} is not quick enough.`);

      // withdrawn young
      young.set({ statusPhase1: "WITHDRAWN" });
      // await young.save();

      // todo send mail saying it is too late :(

      // assign next one from the waiting list
      // await assignNextYoungFromWaitingList(young);
    } else {
      console.log(`${young._id} ${young.firstName} ${young.lastName} is not quick enough. but its statusPhase1 is '${young.statusPhase1}'`);
    }
    young.set({ autoAffectationPhase1ExpiresAt: undefined });
    // await young.save();
  }
  // capture(`RECAP DEPARTEMENT SENT : ${count} mails`);
};

exports.handler = async () => {
  captureMessage("START AUTO AFFECTATION EXPIRED");
  try {
    clean();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};

exports.test = async () => {
  captureMessage("test message every 60 secs");
};

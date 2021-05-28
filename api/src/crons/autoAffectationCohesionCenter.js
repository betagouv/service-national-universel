require("dotenv").config({ path: "./../../.env-prod" });

require("../mongo");
const { sendEmail } = require("../sendinblue");
const path = require("path");
const fs = require("fs");
const { capture, captureMessage } = require("../sentry");
const YoungModel = require("../models/young");
const CohesionCenterObject = require("../models/cohesionCenter");
const { assignNextYoungFromWaitingList, updatePlacesCenter } = require("../utils");

const clean = async () => {
  let countAutoWithdrawn = 0;
  const youngsLimit = await YoungModel.find({ autoAffectationPhase1ExpiresAt: { $lte: Date.now() } });
  captureMessage(`${Date.now()} - ${youngsLimit.length} youngs has autoAffectationPhase1ExpiresAt reached`);
  for (let i = 0; i < youngsLimit.length; i++) {
    const young = youngsLimit[i];
    if (young.statusPhase1 === "WAITING_ACCEPTATION") {
      console.log(`${young._id} ${young.firstName} ${young.lastName} auto withdrawn.`);
      // withdrawn young
      young.set({ statusPhase1: "WITHDRAWN" });
      countAutoWithdrawn++;
      // send mail saying it is too late :(
      await sendNoResponseAffectationMail(young);
      // assign next one from the waiting list
      await assignNextYoungFromWaitingList(young);
    } else {
      console.log(`${young._id} ${young.firstName} ${young.lastName} is not quick enough. but its statusPhase1 is '${young.statusPhase1}'`);
    }
    young.set({ autoAffectationPhase1ExpiresAt: undefined });
    await young.save();
    if (young.cohesionCenterId) {
      const center = await CohesionCenterObject.findById(young.cohesionCenterId);
      if (center) await updatePlacesCenter(center);
    }
  }
  captureMessage(`${countAutoWithdrawn} youngs has been auto withdrawn (48h w/out response)`);
};

const sendNoResponseAffectationMail = async (young) => {
  await sendEmail(
    {
      name: `${young.firstName} ${young.lastName}`,
      email: young.email,
    },
    "La place proposée en séjour de cohésion n'est plus disponible",
    fs
      .readFileSync(path.resolve(__dirname, "../templates/noResponseAffectation.html"))
      .toString()
      .replace(/{{firstName}}/, young.firstName)
      .replace(/{{lastName}}/, young.lastName),
    { bcc: [{ email: "tangi.mendes@selego.co" }] }
  );
};

exports.handler = async () => {
  captureMessage(`${Date.now()} - START AUTO AFFECTATION EXPIRED`);
  try {
    clean();
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};

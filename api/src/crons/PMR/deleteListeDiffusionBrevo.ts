/* import { capture } from "../../sentry";
import slack from "../../slack"; */
//import { deleteDiffusionList } from "../../brevo";

//script
process.env.NODE_CONFIG_DIR = "../../config";
const { initDB } = require("../../mongo");
const { deleteDiffusionList } = require("../../brevo");

(async () => {
  await initDB();

  try {
    const list = await deleteDiffusionList();
    console.log(list);
  } catch (error) {
    console.error("Error occurred:", error);
  }

  console.log("---------------------------------------------------------");
  process.exit(0);
})();

/* export const handler = async (): Promise<void> => {
  try {
    const list = await deleteDiffusionList();
    console.log(list);
  } catch (e) {
    capture(e);
    //slack.error({ title: "DeleteListeDiffusionBrevo", text: JSON.stringify(e) });
    throw e;
  }
}; */

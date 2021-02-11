require("dotenv").config({ path: "../../.env-staging" });

require("../../src/mongo");

const esclient = require("../../src/es");

(async function clean() {
  try {
    // await esclient.indices.delete({ index: "application" });
    // await esclient.indices.delete({ index: "mission" });
    // await esclient.indices.delete({ index: "referent" });
    await esclient.indices.delete({ index: "structure" });
    // await esclient.indices.delete({ index: "young" });
    process.exit(1);
  } catch (error) {
    console.log({ error });
  }
  console.log("cleaned");
})();

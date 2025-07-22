require("dotenv").config({ path: "../../.env-staging" });
require("../mongo");

const imap = require("../imap");

(async () => {
  try {
    imap.fetch();
  } catch (e) {
    console.error(e);
  }
})();

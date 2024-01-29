const events = require("events");
const emailsEmitter = new events.EventEmitter();

require("./cle/classe")(emailsEmitter);
require("./cle/referent")(emailsEmitter);
require("./young/changeCohortEmail")(emailsEmitter);

module.exports = emailsEmitter;

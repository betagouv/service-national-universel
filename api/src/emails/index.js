const events = require('events');
const emailsEmitter = new events.EventEmitter();

require('./cle/classe')(emailsEmitter)
require('./cle/referent')(emailsEmitter)

module.exports = emailsEmitter;

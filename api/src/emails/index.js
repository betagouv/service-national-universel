const events = require('events');
const emailsEmitter = new events.EventEmitter();

require('./cle/classe')(emailsEmitter)

module.exports = emailsEmitter;

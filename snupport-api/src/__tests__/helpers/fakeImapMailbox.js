// Fausse connexion IMAP scriptée : rejoue une boîte en mémoire, sans réseau.
const { EventEmitter } = require("events");

class FakeImap extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    FakeImap.instances.push(this);
  }
  connect() {
    setImmediate(() => this.emit("ready"));
  }
  openBox(box, readOnly, cb) {
    setImmediate(() => cb(null));
  }
  search(searchs, cb) {
    FakeImap.searchCalls.push(searchs);
    const ids = FakeImap.mailbox.map((m) => m.seq);
    setImmediate(() => cb(null, ids));
  }
  fetch(ids) {
    FakeImap.fetchCalls.push([...ids]);
    FakeImap.events.push("fetch");
    const emitter = new EventEmitter();
    setImmediate(() => {
      for (const id of ids) {
        const entry = FakeImap.mailbox.find((m) => m.seq === id);
        const message = new EventEmitter();
        emitter.emit("message", message, id);
        const stream = new EventEmitter();
        message.emit("body", stream);
        stream.emit("data", entry.buffer || Buffer.from(entry.body, "utf8"));
        stream.emit("end");
        message.emit("attributes", { date: entry.date, uid: id });
        message.emit("end");
      }
      emitter.emit("end");
    });
    return emitter;
  }
  closeBox(cb) {
    cb && cb();
  }
  end() {}
  destroy() {}
}

FakeImap.reset = (mailbox = []) => {
  FakeImap.mailbox = mailbox;
  FakeImap.instances = [];
  FakeImap.searchCalls = [];
  FakeImap.fetchCalls = [];
  FakeImap.events = [];
};
FakeImap.reset();

module.exports = FakeImap;

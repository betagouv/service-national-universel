const mongoose = require("mongoose");
const config = require("config");
const slack = require("../slack");
const { capture } = require("../sentry");

exports.handler = async () => {
  try {
    const mongoUrl = config.MONGO_URL;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUrl, options);
    const db = mongoose.connection.db;
    const serverStatus = await db.command({ serverStatus: 1 });
    const connections = serverStatus.connections;

    console.log("MongoMonitoring - Connexions actives:", connections.active);
    console.log("MongoMonitoring - Connexions actuelles:", connections.current);
    console.log("MongoMonitoring - Connexions disponibles:", connections.available);
    console.log("MongoMonitoring - Total des connexions créées:", connections.totalCreated);
    console.log("MongoMonitoring - Threaded:", connections.threaded);
    console.log("MongoMonitoring - Exhaust Is Master:", connections.exhaustIsMaster);
    console.log("MongoMonitoring - Exhaust Hello:", connections.exhaustHello);
    console.log("MongoMonitoring - Awaiting Topology Changes:", connections.awaitingTopologyChanges);

    if (connections.active > 50) {
      await slack.info({
        title: "Mongo DB connection monitor",
        text: `High number of active connections: ${connections.active}`,
      });
    }
  } catch (e) {
    capture(e);
    console.error("Erreur lors de la surveillance des connexions:", e);
    await slack.error({
      title: "Mongo DB connection monitor - Error",
      text: `Erreur lors de la surveillance des connexions: ${e.message}`,
    });
  } finally {
    try {
      await mongoose.disconnect();
    } catch (e) {
      capture(e);
      console.error("Erreur lors de la déconnexion de MongoDB:", e);
    }
  }
};

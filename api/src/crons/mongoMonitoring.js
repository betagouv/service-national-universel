const { capture } = require("../sentry");
const { getDb } = require("../mongo");

function logMetrics(metrics) {
  console.log(JSON.stringify(metrics));
}

exports.handler = async () => {
  const log = {
    service: "MongoDB Monitoring",
    timestamp: new Date().toISOString(),
    metrics: {},
  };
  try {
    const db = getDb().db;
    const serverStatus = await db.command({ serverStatus: 1 });
    const connections = serverStatus.connections;

    log.metrics = {
      activeConnections: connections.active,
      currentConnections: connections.current,
      availableConnections: connections.available,
      totalCreatedConnections: connections.totalCreated,
      threadedConnections: connections.threaded,
      exhaustIsMaster: connections.exhaustIsMaster,
      exhaustHello: connections.exhaustHello,
      awaitingTopologyChanges: connections.awaitingTopologyChanges,
    };

    logMetrics(log);
  } catch (e) {
    capture(e);
    console.error("Erreur lors de la surveillance des connexions:", e);
  }
};

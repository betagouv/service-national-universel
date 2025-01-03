const { capture } = require("../sentry");
const { getDb } = require("../mongo");
const { logger } = require("../logger");

exports.handler = async () => {
  try {
    const db = getDb().db;
    const serverStatus = await db.command({ serverStatus: 1 });
    const connections = serverStatus.connections;

    const metrics = {
      activeConnections: connections.active,
      currentConnections: connections.current,
      availableConnections: connections.available,
      totalCreatedConnections: connections.totalCreated,
      threadedConnections: connections.threaded,
      exhaustIsMaster: connections.exhaustIsMaster,
      exhaustHello: connections.exhaustHello,
      awaitingTopologyChanges: connections.awaitingTopologyChanges,
    };

    logger.info("mongo-metrics", metrics);
  } catch (e) {
    capture(e);
  }
};

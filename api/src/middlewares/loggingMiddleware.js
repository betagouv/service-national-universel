const loggingMiddleware = async (req, res, next) => {
  const startTime = new Date();
  let userlog = "";
  res.on("finish", async () => {
    try {
      const responseTimeMs = new Date() - startTime;
      req.responseTimeMs = responseTimeMs;

      if (req.body?.password) req.body.password = "**********";

      if (req.user) {
        const userRole = req.user.patches.modelName === "ReferentPatches" && "referent";
        userlog = userRole ? ` UserRole: ${req.user?.role} | UserId: ${req.user.id} |` : ` UserId: ${req.user.id} |`;
      }

      const ip = req.ipInfo;

      const hasPayload = req.body && Object.keys(req.body).length > 0;
      const payloadLog = hasPayload ? ` Payload: ${JSON.stringify(req.body)} |` : "";

      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${req.responseTimeMs}ms |${userlog}${payloadLog} IP: ${ip}`);
    } catch (error) {
      console.error("Error in logging middleware:", error);
    }
  });
  next();
};

module.exports = loggingMiddleware;

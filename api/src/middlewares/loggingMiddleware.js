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

      console.log(JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: req.responseTimeMs,
        user: req.user ? {
          role: req.user?.role,
          id: req.user.id
        } : undefined,
        payload: hasPayload ? req.body : undefined,
        ip: ip
      }));
    } catch (error) {
      console.error("Error in logging middleware:", error);
    }
  });
  next();
};

module.exports = loggingMiddleware;

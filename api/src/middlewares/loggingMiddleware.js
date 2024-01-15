const loggingMiddleware = async (req, res, next) => {
  const startTime = new Date();
  let userlog = "";
  res.on("finish", async () => {
    try {
      const responseTimeMs = new Date() - startTime;
      req.responseTimeMs = responseTimeMs;

      if (req.body.password) req.body.password = "**********";

      if (req.user) {
        const userRole = req.user.patches.modelName === "ReferentPatches" ? "referent" : "young";

        userlog = `User: ${userRole} | Id: ${req.user.id} `;
      }
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${req.responseTimeMs}ms | ${userlog}| Body: ${JSON.stringify(req.body)}`);
    } catch (error) {
      console.error("Error in logging middleware:", error);
    }
  });
  next();
};

module.exports = loggingMiddleware;

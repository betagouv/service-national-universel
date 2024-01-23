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
        userlog = userRole ? ` User: ${userRole} | UserId: ${req.user.id} |` : ` UserId: ${req.user.id} |`;
      }

      const ip = req.ipInfo;
      const ip1 = req.headers["x-forwarded-for"];
      const ip2 = req.headers["x-forwarded-for"];

      const headers = JSON.stringify(req.headers);

      const payload = JSON.stringify(req.body);

      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${req.responseTimeMs}ms |${userlog} IP: ${ip} | IP1: ${ip1} | IP2: ${ip2} | Headers: ${headers} | Payload: ${payload}`,
      );
    } catch (error) {
      console.error("Error in logging middleware:", error);
    }
  });
  next();
};

module.exports = loggingMiddleware;

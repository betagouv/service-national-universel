const OPERATION_UNAUTHORIZED = "OPERATION_UNAUTHORIZED";

const onlyAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(401).send({ ok: false, code: OPERATION_UNAUTHORIZED });
  }
};

module.exports = { onlyAdmin };

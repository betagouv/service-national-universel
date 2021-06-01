const passport = jest.createMockFromModule("passport");

passport.authenticate = (type) => {
  return (req, res, next) => {
    req.user = {
      _id: "5feaff5bd23d7f30846d5f00",
    };
    next();
  };
};

module.exports = passport;

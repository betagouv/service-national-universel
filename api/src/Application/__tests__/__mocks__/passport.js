const mongoose = require("mongoose");
const passport = jest.createMockFromModule("passport");
const getNewReferentFixture = require("../fixtures/referent");

passport.user = getNewReferentFixture();
passport.user._id = mongoose.Types.ObjectId();

passport.authenticate = (type) => {
  return (req, res, next) => {
    req.user = passport.user;
    passport.lastTypeCalledOnAuthenticate = type;
    next();
  };
};

module.exports = passport;

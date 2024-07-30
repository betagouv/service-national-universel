/* eslint-disable no-import-assign */
import { Types } from "mongoose";
const { ObjectId } = Types;
import { getNewReferentFixture } from "../fixtures/referent";

const passport = jest.createMockFromModule("passport");

// @ts-ignore
passport.user = getNewReferentFixture();
// @ts-ignore
passport.user._id = new ObjectId();

// @ts-ignore
passport.authenticate = (type) => {
  return (req, res, next) => {
    // @ts-ignore
    req.user = passport.user;
    // @ts-ignore
    passport.lastTypeCalledOnAuthenticate = type;
    next();
  };
};

// ne peux pas être changé en export default car il y a encore des controller en js
module.exports = passport;

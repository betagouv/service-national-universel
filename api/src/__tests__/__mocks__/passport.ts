/* eslint-disable no-import-assign */
import { Types } from "mongoose";
const { ObjectId } = Types;
import { getNewReferentFixture } from "../fixtures/referent";

const passport = jest.createMockFromModule("passport");

// @ts-ignore
passport.user = getNewReferentFixture();
// @ts-ignore
passport.user._id = new ObjectId();

// TODO: mocker correctement les AuthStrategy de passeport
const isValidateUser = (routeAuthtype?: string | string[], userAuthType?: string) => {
  if (!routeAuthtype || !userAuthType) return true;
  let routeAuthtypes = routeAuthtype;
  if (!Array.isArray(routeAuthtype)) {
    routeAuthtypes = [routeAuthtype];
  }
  if (routeAuthtype.length === 0 || routeAuthtypes.includes(userAuthType)) {
    return true;
  }
  return false;
};

// @ts-ignore
passport.authenticate = (type: string | string[]) => {
  return (req, res, next) => {
    // @ts-ignore
    req.user = passport.user;
    // @ts-ignore
    console.log("passport.authenticate type", type, passport.authStrategy);
    // @ts-ignore
    passport.lastTypeCalledOnAuthenticate = type;

    // @ts-ignore
    if (!isValidateUser(type, passport.authStrategy)) {
      return next("INVALID_USER");
    }

    next();
  };
};

// ne peux pas être changé en export default car il y a encore des controller en js
module.exports = passport;

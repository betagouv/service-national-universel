import passport from "passport";

export const agentGuard = passport.authenticate("agent", { session: false });
export const apiKeyGuard = passport.authenticate("apikey", { session: false });
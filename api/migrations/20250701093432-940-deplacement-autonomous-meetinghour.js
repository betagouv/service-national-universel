const { SessionPhase1Model } = require("../src/models");

module.exports = {
  async up(db, client) {
    const sessions = await SessionPhase1Model.find({
      cohesionCenterId: "64244171b83ac4060c2697fe",
      cohort: "2025 HTS 04 - Juillet",
    });
    if (sessions.length !== 1) {
      throw new Error("Expected 1 session, got " + sessions.length + " " + sessions.map((session) => session._id));
    }
    const sejour = sessions[0];
    sejour.set({ deplacementAutonomousMeetingHour: "12:00" });
    await sejour.save();
  },

  async down(db, client) {
    const sessions = await SessionPhase1Model.find({
      cohesionCenterId: "64244171b83ac4060c2697fe",
      cohort: "2025 HTS 04 - Juillet",
    });
    if (sessions.length !== 1) {
      throw new Error("Expected 1 session, got " + sessions.length + " " + sessions.map((session) => session._id));
    }
    const sejour = sessions[0];
    sejour.set({ deplacementAutonomousMeetingHour: "" });
    await sejour.save();
  },
};

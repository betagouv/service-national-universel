const { ReferentModel } = require("../src/models");
const { ReferentCreatedBy } = require("snu-lib");
module.exports = {
  async up() {
    await ReferentModel.updateMany({ "metadata.createdBy": ReferentCreatedBy.UPDATE_REFERENT_2024_2025 }, { $set: { "metadata.isFirstInvitationPending": true } });
  },

  async down() {
    await ReferentModel.updateMany({ "metadata.createdBy": ReferentCreatedBy.UPDATE_REFERENT_2024_2025 }, { $unset: { "metadata.isFirstInvitationPending": 1 } });
  },
};

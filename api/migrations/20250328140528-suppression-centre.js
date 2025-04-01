const { CohesionCenterModel } = require("../src/models");

module.exports = {
  async up() {
    const centerToUnDelete = await CohesionCenterModel.findById("66F3EC1DE56E019E47320326");
    centerToUnDelete.set({ deletedAt: undefined });
    await centerToUnDelete.save();

    const centerToDelete = await CohesionCenterModel.findById("66faa39577e26f1ed3183fef");
    centerToDelete.set({ deletedAt: new Date() });
    await centerToDelete.save();
  },

  async down() {
    const centerToUnDelete = await CohesionCenterModel.findById("66faa39577e26f1ed3183fef");
    centerToUnDelete.set({ deletedAt: undefined });
    await centerToUnDelete.save();
  },
};

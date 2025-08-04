const { logger } = require("../src/logger");
const { ReferentModel } = require("../src/models");
const { ROLES, ReferentStatus } = require("snu-lib");

const rolesToBeDeactivated = [
  ROLES.ADMINISTRATEUR_CLE,
  ROLES.HEAD_CENTER,
  ROLES.HEAD_CENTER_ADJOINT,
  ROLES.REFERENT_CLASSE,
  ROLES.REFERENT_SANITAIRE,
  ROLES.TRANSPORTER,
  ROLES.VISITOR,
];

module.exports = {
  async up() {
    console.time("987 - Deactivating referents");
    const referentsToBeDeactivated = await ReferentModel.find({
      role: { $in: rolesToBeDeactivated },
    }).cursor({ batchSize: 100 });

    // patch library mix up _id when using updatemany and bulk update, so we use a cursor and findByIdAndUpdate instead
    await referentsToBeDeactivated.eachAsync(
      async (referent) => {
        logger.info(`987 - Deactivating referent ${referent._id}`);
        await ReferentModel.findByIdAndUpdate({ _id: referent._id }, { $set: { status: ReferentStatus.INACTIVE } }, { new: false });
      },
      { parallel: 10 },
    );
    console.timeEnd("987 - Deactivating referents");

    console.time("987 - Activating referents");
    const referentsToBeActivated = await ReferentModel.find({
      role: { $nin: rolesToBeDeactivated },
    }).cursor({ batchSize: 100 });

    await referentsToBeActivated.eachAsync(
      async (referent) => {
        logger.info(`987 - Activating referent ${referent._id}`);
        await ReferentModel.findByIdAndUpdate({ _id: referent._id }, { $set: { status: ReferentStatus.ACTIVE } }, { new: false });
      },
      { parallel: 10 },
    );
    console.timeEnd("987 - Activating referents");
  },

  async down() {
    const referentsToRemoveStatus = await ReferentModel.find({}).cursor({ batchSize: 100 });
    await referentsToRemoveStatus.eachAsync(
      async (referent) => {
        logger.info(`987 - Removing status from referent ${referent._id}`);
        await ReferentModel.findByIdAndUpdate({ _id: referent._id }, { $unset: { status: 1 } }, { new: false });
      },
      { parallel: 10 },
    );
  },
};

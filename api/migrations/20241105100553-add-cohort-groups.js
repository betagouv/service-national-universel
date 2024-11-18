import { logger } from "../src/logger";
import { CohortGroupModel, CohortModel } from "../src/models";
import { COHORT_TYPE } from "snu-lib";

const pipeline = [
  {
    $addFields: {
      year: { $year: "$dateStart" },
    },
  },
  {
    $group: {
      _id: { type: "$type", year: "$year" },
      documents: {
        $push: { _id: "$_id", name: "$name" },
      },
    },
  },
  {
    $project: {
      _id: 0,
      type: "$_id.type",
      year: "$_id.year",
      documents: 1,
    },
  },
];

const fromUser = { firstName: "Migration ajout des groupes de cohortes" };

function formatGroupName(type, year) {
  return `${type === COHORT_TYPE.VOLONTAIRE ? "HTS" : "CLE"} ${year}`;
}

module.exports = {
  async up() {
    try {
      const groups = await CohortModel.aggregate(pipeline);

      if (!groups.length) {
        logger.info("No group to migrate");
        return;
      }

      logger.info(`Groupes de cohorte à créer : ${groups.length} + groupe de réserve.`);

      const reserveGroup = new CohortGroupModel({ name: "Réserve" });
      await reserveGroup.save({ fromUser });

      const groupMap = new Map();

      const groupInserts = groups.map((group) => {
        const { type, year } = group;
        const name = formatGroupName(type, year);
        const newGroup = new CohortGroupModel({ type, year, name });
        groupMap.set(name, newGroup._id);
        return newGroup.save({ fromUser });
      });

      const insertedGroups = await Promise.all(groupInserts);
      logger.info(`Insertion des nouveaux groupes terminée. Nombre de groupes insérés: ${insertedGroups.length}`);

      const cohorts = await CohortModel.find();

      const cohortUpdates = cohorts.map((cohort) => {
        const groupName = formatGroupName(cohort.type, new Date(cohort.dateStart).getFullYear());
        const groupId = cohort.name === "à venir" ? reserveGroup._id : groupMap.get(groupName);
        if (!groupId) {
          throw new Error(`Group not found: ${groupName}`);
        }
        return cohort.set({ cohortGroupId: groupId }).save({ fromUser });
      });

      const updatedCohorts = await Promise.all(cohortUpdates);
      logger.info(`Mise à jour des cohortes terminée avec succès. Nombre de cohortes mises à jour: ${updatedCohorts.length}`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },

  async down() {
    try {
      await CohortModel.updateMany({ cohortGroupId: { $exists: true } }, { $unset: { cohortGroupId: "" } });
      await CohortGroupModel.deleteMany({});
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
};

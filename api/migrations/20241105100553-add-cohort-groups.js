import { CohortGroupModel, CohortModel } from "../../../../src/models";
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

module.exports = {
  async up() {
    try {
      const reserveGroup = new CohortGroupModel({ name: "Réserve" });
      await reserveGroup.save({ fromUser });

      const groups = await CohortModel.aggregate(pipeline);

      for (const group of groups) {
        const type = group.type;
        const year = group.year;
        const name = `${type === COHORT_TYPE.VOLONTAIRE ? "HTS" : "CLE"} ${year}`;
        const newGroup = new CohortGroupModel({ type, year, name });
        await newGroup.save({ fromUser });

        for (const doc of group.documents) {
          if (!doc._id) continue;
          const cohort = await CohortModel.findById(doc._id);
          if (!cohort) throw new Error(`Cohort not found: ${doc._id}`);

          if (cohort.name === "à venir") {
            cohort.set({ cohortGroupId: reserveGroup._id });
          } else {
            cohort.set({ cohortGroupId: newGroup._id });
          }
          await cohort.save({ fromUser });
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  async down() {
    await CohortGroupModel.deleteMany({});
    await CohortModel.updateMany({ cohortGroupId: { $exists: true } }, { $unset: { cohortGroupId: "" } });
  },
};

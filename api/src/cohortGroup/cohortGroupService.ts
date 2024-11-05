import { CohortGroupModel } from "../models/cohortGroup";

export async function getCohortGroupsWithDateStart() {
  const aggregationPipeline = [
    {
      $lookup: {
        from: "cohorts",
        localField: "_id",
        foreignField: "cohortGroupId",
        as: "cohorts",
      },
    },
    {
      $unwind: "$cohorts",
    },
    {
      $group: {
        _id: "$_id",
        dateStart: { $min: "$cohorts.dateStart" },
        cohortGroup: { $first: "$$ROOT" },
      },
    },
    {
      $addFields: {
        "cohortGroup.dateStart": "$dateStart",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$cohortGroup",
      },
    },
  ];
  return await CohortGroupModel.aggregate(aggregationPipeline);
}

import { ReferentModel } from "../../models";
import { STATUS_CLASSE } from "snu-lib";

export const findReferentsClasseToSendInvitationByClasseStatus = async (classeStatus: keyof typeof STATUS_CLASSE) => {
  const referentsClasseToSendInvitationIds = await findReferentsClasseIdsToSendInvitationByClasseStatus(classeStatus);
  return ReferentModel.find({ _id: { $in: referentsClasseToSendInvitationIds.map((r) => r._id) } });
};

const findReferentsClasseIdsToSendInvitationByClasseStatus = async (classeStatus: keyof typeof STATUS_CLASSE) =>
  await ReferentModel.aggregate([
    {
      $match: {
        role: "referent_classe",
        "metadata.isFirstInvitationPending": true,
      },
    },
    {
      $addFields: {
        idString: {
          $toString: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "classes",
        localField: "idString",
        foreignField: "referentClasseIds",
        as: "classes",
      },
    },
    {
      $match: {
        "classes.status": classeStatus,
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

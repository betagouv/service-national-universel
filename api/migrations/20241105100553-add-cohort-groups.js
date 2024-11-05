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

module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};

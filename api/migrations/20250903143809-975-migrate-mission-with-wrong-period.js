const { MISSION_STATUS } = require("snu-lib");

module.exports = {
  async up(db, client) {
    console.log("Starting migration: Moving invalid period values to subPeriod...");

    const validPeriodValues = ["WHENEVER", "DURING_HOLIDAYS", "DURING_SCHOOL"];

    const invalidPeriodValues = ["WEEKEND", "EVENING", "END_DAY", "AUTUMN", "DECEMBER", "WINTER", "SPRING", "SUMMER"];

    const missionsWithInvalidPeriod = await db
      .collection("missions")
      .find({
        period: { $in: invalidPeriodValues },
        endAt: { $lt: new Date(2023, 0, 1) },
      })
      .toArray();

    console.log(`Found ${missionsWithInvalidPeriod.length} missions with invalid period values`);

    let migratedCount = 0;

    for (const mission of missionsWithInvalidPeriod) {
      const currentPeriod = mission.period || [];
      const currentSubPeriod = mission.subPeriod || [];

      const validPeriods = currentPeriod.filter((p) => validPeriodValues.includes(p));
      const invalidPeriods = currentPeriod.filter((p) => invalidPeriodValues.includes(p));

      const newSubPeriod = [...new Set([...currentSubPeriod, ...invalidPeriods])];

      // On utilise le driver node et non pas mongoose pour éviter les erreurs de validation
      await db.collection("missions").updateOne(
        { _id: mission._id },
        {
          $set: {
            period: validPeriods,
            subPeriod: newSubPeriod,
            status: MISSION_STATUS.ARCHIVED,
          },
        },
      );

      migratedCount++;

      if (migratedCount % 100 === 0) {
        console.log(`Migrated ${migratedCount}/${missionsWithInvalidPeriod.length} missions...`);
      }
    }

    console.log(`Migration completed: ${migratedCount} missions migrated`);

    const remainingInvalidPeriods = await db.collection("missions").countDocuments({
      period: { $in: invalidPeriodValues },
    });

    if (remainingInvalidPeriods > 0) {
      console.warn(`Warning: ${remainingInvalidPeriods} missions still have invalid period values`);
    } else {
      console.log("✅ All invalid period values have been successfully migrated");
    }
  },

  async down(db, client) {},
};

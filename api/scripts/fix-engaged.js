require("dotenv").config({ path: "./../.env-prod" });
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");

require("../src/mongo");

const opts = { define: { freezeTableName: true, timestamps: false }, logging: false };
const connexionURL = process.env.MYSQL_URL;
const sequelize = new Sequelize(connexionURL, opts);

const Young = require("../src/models/young");

sequelize.authenticate().then(async (e) => {
  await migrateYoung();
  process.exit(1);
});

async function migrateYoung() {
  const youngsSQL = await sequelize.query("SELECT * FROM `youngs`", { type: QueryTypes.SELECT });
  let count = 0;
  console.log(`${youngsSQL.length} youngs detected`);
  for (let i = 0; i < youngsSQL.length; i++) {
    try {
      const y = youngsSQL[i];
      if (!y.email) continue;
      const youngMongo = await Young.findOne({ email: y.email });
      if (youngMongo) {
        const engaged = y.engaged === "Oui" ? "true" : "false";
        const engagedStructure = y.engaged_structure;
        const missionFormat = y.mission_format === "Continue" ? "CONTINUOUS" : "DISCONTINUOUS";
        youngMongo.set({ engaged, missionFormat, engagedStructure });
        await youngMongo.save();
        await youngMongo.index();
        count++;
        console.log(`${count}/${youngsSQL.length}`, engaged);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

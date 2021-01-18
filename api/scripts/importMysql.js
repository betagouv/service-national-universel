require("dotenv").config({ path: "./../.env" });
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
require("../src/mongo");

const opts = { define: { freezeTableName: true, timestamps: false }, logging: false };
const sequelize = new Sequelize(process.env.MYSQL_URL, opts);

const Mission = require(`../src/models/mission`);
const Structure = require(`../src/models/structure`);
const User = require(`../src/models/user`);
const Young = require(`../src/models/young`);

async function importUser() {
  const usersSQL = await sequelize.query("SELECT * FROM `users`", { type: QueryTypes.SELECT });

  usersSQL.eachAsync(async (u) => {
    try {
      const user = {
        name: u.name,
        email: u.email,
      };
      await User.create(user);
    } catch (error) {
      console.log(error);
    }
  });
}

async function importStructure() {
  const structuresSQL = await sequelize.query("SELECT * FROM `structures`", { type: QueryTypes.SELECT });

  structuresSQL.forEach(async (s) => {
    try {
      const structure = { ...s };
      structure.is_reseau = !!structure.is_reseau;
      structure.location = {
        lon: parseFloat(structure.longitude),
        lat: parseFloat(structure.latitude),
      };

      delete structure.id;
      // await Structure.create(structure);
    } catch (error) {
      console.log(error);
    }
  });
}

async function importMission() {
  const missionsSQL = await sequelize.query("SELECT * FROM `missions`", { type: QueryTypes.SELECT });

  missionsSQL.forEach(async (m) => {
    try {
      const mission = { ...m };
      mission.places = m.participations_max;
      mission.location = {
        lon: parseFloat(mission.longitude),
        lat: parseFloat(mission.latitude),
      };
      mission.remote = !!m.is_everywhere;
      mission.domain = m.domaines;

      delete mission.id;
      // await Mission.create(mission);
    } catch (error) {
      console.log(error);
    }
  });
}

async function importYoung() {
  const youngsSQL = await sequelize.query("SELECT * FROM `youngs`", { type: QueryTypes.SELECT });

  youngsSQL.forEach(async (y) => {
    try {
      const young = { ...y };
      young.nationalite_francaise = !!y.nationalite_francaise;
      young.engaged = !!y.engaged;
      if (y.longitude && y.latitude) {
        young.location = { lon: parseFloat(y.longitude), lat: parseFloat(y.latitude) };
      }
      delete young.id;
      await Young.create(young);
    } catch (error) {
      console.log(error);
    }
  });
}

importYoung();

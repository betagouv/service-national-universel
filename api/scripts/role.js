require("dotenv").config({ path: "./../.env-prod" });

const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
require("../src/mongo");
var faker = require("faker/locale/fr");

const opts = { define: { freezeTableName: true, timestamps: false }, logging: false };

const connexionURL = "mysql://ulgibn9uaa040ayv:Jd1IlqlrHrBIeVnSzPGm@bk1mgoxu5fmusuvklzdu-mysql.services.clever-cloud.com:20452/bk1mgoxu5fmusuvklzdu";
const sequelize = new Sequelize(connexionURL, opts);

const getElasticInstance = require("../src/es/index");
const esclient = getElasticInstance();

sequelize.authenticate().then(async (e) => {
  const profilesSql = await sequelize.query("SELECT * FROM `profiles`", { type: QueryTypes.SELECT });
  console.log(`${profilesSql.length} profiles detected`);
  profilesSql.forEach(async (u) => {
    console.log("e", u);
  });
});

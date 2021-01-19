const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const faker = require("faker");

const { Client } = require("@elastic/elasticsearch");

const envProdConfig = dotenv.parse(fs.readFileSync("../.env-prod"));
const envStagingConfig = dotenv.parse(fs.readFileSync("../.env-staging"));

const DB_ENDPOINT_PRODUCTION = envProdConfig.MONGO_URL;
const ES_ENDPOINT_PRODUCTION = envProdConfig.ES_ENDPOINT;

const DB_ENDPOINT_STAGING = envStagingConfig.MONGO_URL;
const ES_ENDPOINT_STAGING = envStagingConfig.ES_ENDPOINT;

(async () => {
  await migrate("young", (doc) => {
    if (doc.email === "se.legoff@gmail.com") return doc;

    doc.set({ email: `${doc._id}@mail.com` });
    doc.set({ firstName: faker.name.firstName() });
    doc.set({ lastName: faker.name.lastName() });
    return doc;
  });
  await migrate("referent", (doc) => {
    if (doc.email === "se.legoff@gmail.com") return doc;

    doc.set({ email: `${doc._id}@mail.com` });
    doc.set({ firstName: faker.name.firstName() });
    doc.set({ lastName: faker.name.lastName() });
    return doc;
  });

  await migrate("school", (doc) => {
    return doc;
  });
  console.log("END");
})();

async function migrate(model, cb) {
  const connection_mongo_prod = await createConnection(DB_ENDPOINT_PRODUCTION);
  const connection_mongo_staging = await createConnection(DB_ENDPOINT_STAGING);

  const connection_es_prod = new Client({ node: `https://${ES_ENDPOINT_PRODUCTION}` });
  const connection_es_staging = new Client({ node: `https://${ES_ENDPOINT_STAGING}` });

  let start_at = Date.now();

  // TO prevent all midlleware (Sendinblue etc to work)
  const Schema = require(`../src/models/${model}`).schema;
  const ModelProduction = connection_mongo_prod.model(model, Schema);
  const ModelStaging = connection_mongo_staging.model(model, Schema);

  //clean staging
  console.log(`Start delete staging db ${model}`);
  await ModelStaging.deleteMany({});
  console.log(`End delete staging db  ${model}`);

  console.log(`Start delete staging es ${model}`);
  try {
    const exists = await connection_es_staging.indices.exists({ index: model });
    if (exists) await connection_es_staging.indices.delete({ index: model });
  } catch (e) {
    console.log("e", e);
  }
  console.log(`End delete staging es ${model}`);

  //end clean staging

  const mapping = getMapping(Schema);
  await connection_es_staging.indices.create({ index: model });
  function time() {
    const total = Math.floor((Date.now() - start_at) / 1000);
    console.log(`Created ${count} in ${Math.floor(total / 60)} m ${Math.floor(total % 60)} s`);
  }

  console.log(`Start create all  ${model}`);
  let count = 0;
  let arr = [];

  async function bulk() {
    const body1 = arr.map((e) => JSON.parse(JSON.stringify(e)));
    await ModelStaging.insertMany(body1);

    const body = [];
    for (let i = 0; i < arr.length; i++) {
      const obj = serialize(arr[i], mapping);
      const d = JSON.parse(JSON.stringify(obj));
      delete d._id;
      body.push({ index: { _index: model, _type: "_doc", _id: arr[i]._id } });
      body.push(d);
    }
    await connection_es_staging.bulk({ refresh: true, body });
    time();
  }

  let cursor = ModelProduction.find().select("+password").sort({ _id: 1 }).cursor();
  await cursor.eachAsync(async function (doc) {
    arr.push(cb ? cb(doc) : doc);
    count++;
    if (arr.length >= 100) {
      await bulk();
      arr = [];
    }
  });

  if (arr.length) await bulk();
}

function createConnection(endpoint) {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(endpoint); // Get Mongoose to use the global promise library
    //Bind connection to error event (to get notification of connection errors)
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    db.once("open", () => {
      console.log("Connected");
      resolve(db);
    });
  });
}

function getMapping(schema) {
  const properties = {};

  for (let i = 0; i < Object.keys(schema.paths).length; i++) {
    const key = Object.keys(schema.paths)[i];

    const exclude = ["id", "__v", "_id"];
    if (exclude.includes(key)) continue;

    const mongooseType = schema.paths[key].instance;

    if (schema.paths[key].options.es_mapping) {
      properties[key] = schema.paths[key].options.es_mapping;
      continue;
    }

    //geoloc

    if (key === "location.lat") continue;
    if (key === "location.lon") {
      properties["location"] = { type: "geo_point" };
      continue;
    }

    switch (mongooseType) {
      case "ObjectID":
      case "String":
        properties[key] = {
          type: "text",
          fields: { keyword: { type: "keyword", ignore_above: 256 } },
        };
        break;
      case "Date":
        properties[key] = { type: "date" };
        break;
      case "Number":
        properties[key] = { type: "long" };
        break;
      case "Boolean":
        properties[key] = { type: "boolean" };
        break;

      case "Array":
        if (schema.paths[key].caster.instance === "String") {
          properties[key] = {
            type: "text",
            fields: { keyword: { type: "keyword", ignore_above: 256 } },
          };
        }

        break;
      default:
        break;
    }
  }

  return { properties };
}

function serialize(model, mapping) {
  let name, outModel;

  function _serializeObject(object, mappingData) {
    let serialized = {};
    let field;
    let val;
    for (field in mappingData.properties) {
      if (mappingData.properties.hasOwnProperty(field)) {
        val = serialize.call(object, object[field], mappingData.properties[field]);
        if (val !== undefined) {
          serialized[field] = val;
        }
      }
    }
    return serialized;
  }

  if (mapping.properties && model) {
    if (Array.isArray(model)) return model.map((object) => _serializeObject(object, mapping));
    return _serializeObject(model, mapping);
  }

  if (mapping.cast && typeof mapping.cast !== "function") throw new Error("es_cast must be a function");

  outModel = mapping.cast ? mapping.cast.call(this, model) : model;
  if (typeof outModel === "object" && outModel !== null) {
    name = outModel.constructor.name;
    if (name === "ObjectID") return outModel.toString();
    if (name === "Date") return new Date(outModel).toJSON();
  }

  return outModel;
}

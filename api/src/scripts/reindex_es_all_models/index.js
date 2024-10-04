const config = require("config");

const fs = require("fs");
const path = require("path");
const dir = path.dirname(__filename);
const { initDB } = require("../../mongo");

const esClient = require("../../es");

const {
  ApplicationModel,
  CohortModel,
  CohesionCenterModel,
  ContractModel,
  DepartmentServiceModel,
  EventModel,
  InscriptionGoalModel,
  MeetingPointModel,
  MissionModel,
  MissionAPIModel,
  MissionEquivalenceModel,
  ProgramModel,
  ReferentModel,
  SessionPhase1Model,
  SessionPhase1TokenModel,
  StructureModel,
  WaitingListModel,
  YoungModel,
  PointDeRassemblementModel,
  ModificationBusModel,
  PlanTransportModel,
  LigneBusModel,
  LigneToPointModel,
  EmailModel,
  ClasseModel,
  EtablissementModel,
  SchoolRAMSESModel,
} = require("../../models");

const StatsYoungCenterModel = require("../../models/legacy/stats-young-center");

const MAPPING_DIR = path.join(dir, "./mappings");

const args = process.argv.slice(2);
let groupName = null;
if (args.length > 0) {
  groupName = args[0];
}

async function reindexESAllModels() {
  try {
    const all_models = [
      ApplicationModel,
      // BusModel,
      CohesionCenterModel,
      ContractModel,
      DepartmentServiceModel,
      EventModel,
      InscriptionGoalModel,
      MeetingPointModel,
      MissionModel,
      MissionAPIModel,
      MissionEquivalenceModel,
      ProgramModel,
      ReferentModel,
      // SchoolModel,
      SessionPhase1Model,
      SessionPhase1TokenModel,
      StatsYoungCenterModel,
      StructureModel,
      // SupportTagModel,
      // SupportTicketModel,
      WaitingListModel,
      YoungModel,
      // ZammadTicketModel,
      PointDeRassemblementModel,
      ModificationBusModel,
      LigneBusModel,
      LigneToPointModel,
      SchoolRAMSESModel,
    ];

    const useful_models = [
      ApplicationModel,
      // BusModel,
      CohesionCenterModel,
      ModificationBusModel,
      PointDeRassemblementModel,
      // MeetingPointModel,
      MissionModel,
      // MissionAPIModel,
      ReferentModel,
      // SchoolModel,
      // SchoolRAMSESModel,
      SessionPhase1Model,
      StructureModel,
      YoungModel,
      LigneBusModel,
      PlanTransportModel,
      EmailModel,
      CohortModel,
      ClasseModel,
      EtablissementModel,
    ];

    const populates = {
      [ClasseModel.modelName]: ["etablissement"],
    };

    // const models_indexed = [CohortModel]; // useful_models;
    let models_indexed = useful_models;

    if (groupName === "all") {
      models_indexed = all_models;
    } else if (groupName === "useful") {
      models_indexed = useful_models;
    } else if (groupName === "centre") {
      models_indexed = [CohesionCenterModel, PointDeRassemblementModel];
    } else if (groupName === "cle") {
      models_indexed = [ClasseModel, EtablissementModel];
    } else if (groupName === "none") {
      process.exit(1);
      return;
    }

    async function cleanIndex(model) {
      const index = model.modelName;
      try {
        const exist = await esClient.indices.exists({ index });
        if (exist || exist?.body) {
          await esClient.indices.delete({ index: index });
          console.log(`Index ${index} deleted`);
        }
      } catch (error) {
        console.log(`Index ${index} doesn't exist already`);
      }

      console.log("Add mappings");
      try {
        const data = fs.readFileSync(`${MAPPING_DIR}/${index}.json`);
        const body = JSON.parse(data);
        await esClient.indices.create({ index, body });
      } catch (error) {
        console.log("Mapping by default : Everything will be mapped");
      }

      console.log("INDEXING", index);
      let bulk = [];

      async function flush() {
        if (!bulk.length) return;
        const bodyES = bulk.flatMap((obj) => {
          let objFormatted = obj.toObject();
          delete objFormatted._id;
          return [{ index: { _index: index, _id: obj._id.toString() } }, objFormatted];
        });
        await esClient.bulk({ refresh: true, body: bodyES });
        console.log("INDEXED", bulk.length);
        bulk = [];
      }

      async function findAll(Model, where, cb) {
        let count = 0;
        const total = await Model.countDocuments(where);
        const find = Model.find(where);
        if (populates[Model.modelName]) find.populate(populates[Model.modelName]);
        await find
          .cursor()
          .addCursorFlag("noCursorTimeout", true)
          .eachAsync(async (doc) => {
            try {
              await cb(doc, count++, total);
            } catch (e) {
              console.log("e", e);
            }
          });
      }

      await findAll(model, {}, async (doc, i, total) => {
        try {
          console.log(`Indexing ${index} ${i + 1}/${total}`);
          bulk.push(doc);
          if (bulk.length >= 1000) await flush();
        } catch (e) {
          console.log("Error", e);
        }
      });

      await flush();
    }

    console.time("Indexing models");
    await initDB();
    for (const model of models_indexed) {
      await cleanIndex(model);
    }
    console.timeEnd("Indexing models");
    process.exit(0);
  } catch (e) {
    console.log("Error:", e);
  }
}

module.exports = reindexESAllModels;

if (require.main === module) {
  reindexESAllModels();
}

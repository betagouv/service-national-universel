const config = require("config");

const fs = require("fs");
const path = require("path");
const dir = path.dirname(__filename);
const { initDB } = require("../../mongo");

const esClient = require("../../es");

const { ApplicationModel } = require("../../models");
const { CohortModel } = require("../../models");
const { CohesionCenterModel } = require("../../models");
const { ContractModel } = require("../../models");
const { DepartmentServiceModel } = require("../../models");
const { EventModel } = require("../../models");
const { InscriptionGoalModel } = require("../../models");
const { MeetingPointModel } = require("../../models");
const { MissionModel } = require("../../models");
const { MissionAPIModel } = require("../../models");
const { MissionEquivalenceModel } = require("../../models");
const { ProgramModel } = require("../../models");
const { ReferentModel } = require("../../models");
const { SessionPhase1Model } = require("../../models");
const { SessionPhase1TokenModel } = require("../../models");
const StatsYoungCenterModel = require("../../models/legacy/stats-young-center");
const { StructureModel } = require("../../models");
const { WaitingListModel } = require("../../models");
const { YoungModel } = require("../../models");
const { PointDeRassemblementModel } = require("../../models");
const { ModificationBusModel } = require("../../models");
const { PlanTransportModel } = require("../../models");
const { LigneBusModel } = require("../../models");
const { LigneToPointModel } = require("../../models");
const { EmailModel } = require("../../models");
// CLE
const { ClasseModel } = require("../../models");
const { EtablissementModel } = require("../../models");

const MAPPING_DIR = path.join(dir, "./mappings");

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
    const models_indexed = useful_models;

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

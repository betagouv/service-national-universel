const config = require("config");

const fs = require("fs");
const path = require("path");
const dir = path.dirname(__filename);
const { initDB } = require("../../mongo");

const esClient = require("../../es");

const ApplicationModel = require("../../models/application");
// const BusModel = require("../../models/bus");
const CohortModel = require("../../models/cohort");
const CohesionCenterModel = require("../../models/cohesionCenter");
const ContractModel = require("../../models/cohesionCenter");
const DepartmentServiceModel = require("../../models/departmentService");
const EventModel = require("../../models/event");
const InscriptionGoalModel = require("../../models/inscriptionGoal");
const MeetingPointModel = require("../../models/meetingPoint");
const MissionModel = require("../../models/mission");
const MissionAPIModel = require("../../models/missionAPI");
const MissionEquivalenceModel = require("../../models/missionEquivalence");
const ProgramModel = require("../../models/program");
const ReferentModel = require("../../models/referent");
// const SchoolModel = require("../../models/school");
const SchoolRAMSESModel = require("../../models/schoolRAMSES");
const SessionPhase1Model = require("../../models/sessionPhase1");
const SessionPhase1TokenModel = require("../../models/sessionPhase1token");
const StatsYoungCenterModel = require("../../models/legacy/stats-young-center");
const StructureModel = require("../../models/structure");
// const SupportTagModel = require("../../models/supportTag");
// const SupportTicketModel = require("../../models/supportTicket");
const WaitingListModel = require("../../models/waitingList");
const YoungModel = require("../../models/young");
// const ZammadTicketModel = require("../../models/zammad-ticket");
const PointDeRassemblementModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const DemandeDeModificationModel = require("../../models/PlanDeTransport/modificationBus");
const PlanDeTransportModel = require("../../models/PlanDeTransport/planTransport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const EmailModel = require("../../models/email");
// CLE
const ClasseModel = require("../../models/cle/classe");
const EtablissementModel = require("../../models/cle/etablissement");

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
      DemandeDeModificationModel,
      LigneBusModel,
      LigneToPointModel,
    ];

    const useful_models = [
      ApplicationModel,
      // BusModel,
      CohesionCenterModel,
      DemandeDeModificationModel,
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
      PlanDeTransportModel,
      EmailModel,
      CohortModel,
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

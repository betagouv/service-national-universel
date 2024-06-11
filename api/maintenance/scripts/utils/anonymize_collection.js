const readline = require("node:readline");
const { EJSON } = require("bson");

MODULE_PATH = `${__dirname}/../../../src/anonymization`;

ANONYMIZABLE_COLLECTIONS = {
  applications: `${MODULE_PATH}/application`,
  cohesioncenters: `${MODULE_PATH}/cohesionCenter`,
  contracts: `${MODULE_PATH}/contract`,
  departmentservices: `${MODULE_PATH}/departmentService`,
  meetingpoints: `${MODULE_PATH}/meetingPoint`,
  missions: `${MODULE_PATH}/mission`,
  missionequivalences: `${MODULE_PATH}/missionEquivalence`,
  referents: `${MODULE_PATH}/referent`,
  sessionphase1: `${MODULE_PATH}/sessionPhase1`,
  structures: `${MODULE_PATH}/structure`,
  waitinglists: `${MODULE_PATH}/waitingList`,
  youngs: `${MODULE_PATH}/young`,
  lignebuses: `${MODULE_PATH}/PlanDeTransport/ligneBus`,
  modificationbuses: `${MODULE_PATH}/PlanDeTransport/modificationBus`,
};

const args = process.argv.slice(2);
if (args.length != 1) {
  console.error("Usage: node anonymize_collection.js <collection_name>");
  process.exit(1);
}

collection_name = args[0];

function anonymizeCollectionStream(anonymize) {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  rl.on("line", (line) => {
    const relaxed = false;
    const parsed = EJSON.parse(line, { relaxed });
    const anonymized = anonymize(parsed);
    const json = EJSON.stringify(anonymized, { relaxed });

    console.log(json);
  });
}

if (collection_name in ANONYMIZABLE_COLLECTIONS) {
  const anonymize = require(ANONYMIZABLE_COLLECTIONS[collection_name]);
  anonymizeCollectionStream(anonymize);
} else {
  process.stdin.pipe(process.stdout);
}

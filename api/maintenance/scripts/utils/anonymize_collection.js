
const readline = require('node:readline');
const { EJSON } =  require('bson');

MODELS_PATH = `${__dirname}/../../../src/models`

ANONYMIZABLE_COLLECTIONS = {
  "applications": `${MODELS_PATH}/application`,
  "cohesioncenters": `${MODELS_PATH}/cohesionCenter`,
  "contracts": `${MODELS_PATH}/contract`,
  "departmentservices": `${MODELS_PATH}/departmentService`,
  "meetingpoints": `${MODELS_PATH}/meetingPoint`,
  "missions": `${MODELS_PATH}/mission`,
  "missionequivalences": `${MODELS_PATH}/missionEquivalence`,
  "referents": `${MODELS_PATH}/referent`,
  "sessionphase1": `${MODELS_PATH}/sessionPhase1`,
  "structures": `${MODELS_PATH}/structure`,
  "waitinglists": `${MODELS_PATH}/waitingList`,
  "youngs": `${MODELS_PATH}/young`,
  "lignebuses": `${MODELS_PATH}/ligneBus`,
  "modificationbuses": `${MODELS_PATH}/modificationBus`,
}


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
    // process a line at a time
    console.log(json)
  });
}

if (collection_name in ANONYMIZABLE_COLLECTIONS) {
  const anonymize = require(ANONYMIZABLE_COLLECTIONS[collection_name]).anonymize
  anonymizeCollectionStream(anonymize);
} else {
  process.stdin.pipe(process.stdout)
}

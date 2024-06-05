
const readline = require('node:readline/promises');
const { stdin: input, stdout: output, stdin } = require('node:process');
const { EJSON } =  require('bson');

MODELS_PATH = `${__dirname}/../../api/src/models`

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

if (process.argv.length != 2) {
  console.error(`Usage: ${process.argv[0]} <collection_name>`);
  process.exit(1);
}

collection_name = process.argv[1];

async function anonymizeCollectionStream(anonymize) {
  const rl = readline.createInterface({ input, output });

  for await (const input of rl) {
    const relaxed = false;
    const parsed = EJSON.parse(input, { relaxed });
    const anonymized = anonymize(parsed)
    const output = EJSON.stringify(anonymized, { relaxed })

    console.log(output)
  }
}

if (collection_name in ANONYMIZABLE_COLLECTIONS) {
  const anonymize = require(ANONYMIZABLE_COLLECTIONS[collection_name]).anonymize
  anonymizeCollectionStream(anonymize);
} else {
  process.stdin.pipe(process.stdout)
}

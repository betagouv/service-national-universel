import { resolveMongoSource } from "./resolveMongoSource";

const stopMongodbTestContainer = async () => {
    if (resolveMongoSource(process.env).kind === "external") {
        return;
    }
    console.time("StoppingMongoDb");
    await global.mongodbContainer.stop();
    console.timeEnd("StoppingMongoDb");
};

export default stopMongodbTestContainer;

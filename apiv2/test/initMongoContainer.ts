import { MongoDBContainer } from "@testcontainers/mongodb";

import { resolveMongoSource } from "./resolveMongoSource";

const testConfig = {
    mongodb: {
        image: "mongo:6.0.1",
        options: {
            directConnection: true,
        },
    },
};

const startSharedMongodbTestContainer = async () => {
    if (resolveMongoSource(process.env).kind === "external") {
        return;
    }
    global.mongodbContainer = await startMongodbTestContainer();
};

export const getSharedConnectionString = () => {
    const source = resolveMongoSource(process.env);
    if (source.kind === "external") {
        return source.uri;
    }
    return global.mongodbContainer.getConnectionString();
};

export const startMongodbTestContainer = async () => {
    console.time("StartingMongoDb");
    const mongodbContainer = await new MongoDBContainer(testConfig.mongodb.image).start();
    console.timeEnd("StartingMongoDb");
    return mongodbContainer;
};

export default startSharedMongodbTestContainer;

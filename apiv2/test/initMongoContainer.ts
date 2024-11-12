import { MongoDBContainer } from "@testcontainers/mongodb";

const testConfig = {
    mongodb: {
        image: "mongo:6.0.1",
        options: {
            directConnection: true,
        },
    },
};

const startSharedMongodbTestContainer = async () => {
    global.mongodbContainer = await startMongodbTestContainer();
};

export const getSharedConnectionString = () => {
    return global.mongodbContainer.getConnectionString();
};

export const startMongodbTestContainer = async () => {
    console.time("StartingMongoDb");
    const mongodbContainer = await new MongoDBContainer(testConfig.mongodb.image).start();
    console.timeEnd("StartingMongoDb");
    return mongodbContainer;
};

export default startSharedMongodbTestContainer;

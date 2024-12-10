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
    //global.mongodbContainer = await startMongodbTestContainer();
};

export const getSharedConnectionString = () => {
    //return global.mongodbContainer.getConnectionString();
    return "mongodb://localhost:27017/"
};

export const startMongodbTestContainer = async () => {
    console.time("StartingMongoDb");
   // const mongodbContainer = await new MongoDBContainer(testConfig.mongodb.image).start();
    //return mongodbContainer;
    const container = {getConnectionString: () => "mongodb://localhost:27017/"}
    console.timeEnd("StartingMongoDb");

    return container;
};

export default startSharedMongodbTestContainer;

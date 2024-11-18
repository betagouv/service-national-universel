const stopMongodbTestContainer = async () => {
    console.time("StoppingMongoDb");
    await global.mongodbContainer.stop();
    console.timeEnd("StoppingMongoDb");
};

export default stopMongodbTestContainer;

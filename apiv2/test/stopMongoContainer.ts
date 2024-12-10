const stopMongodbTestContainer = async () => {
    console.time("StoppingMongoDb");
    console.log("stop")
    //await global.mongodbContainer.stop();
    console.timeEnd("StoppingMongoDb");
};

export default stopMongodbTestContainer;

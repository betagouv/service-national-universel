// To test run:
// node ./src/crons/__tester__.js --cron patch/young

(async () => {
  await require("../../../env-manager")("api-prod");

  switch (process.argv[3]) {
    case "patch/young":
      require("./patch/young").manualHandler("2023-08-17", "2023-08-18");
      break;
  }
})();

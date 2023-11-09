// To test run:
// node ./src/crons/__tester__.js patch/young

// You need to run in local apps and target the right database (Prod usually)

(async () => {
  await require("../env-manager")();

  switch (process.argv[2]) {
    case "patch/young":
      require("./patch/young").manualHandler("2023-11-08", "2023-11-09");
      break;
    case "refresh-materialized-views":
      require("./patch/refresh-materialized-views").handler();
      break;
    case "patch/structure":
      require("./patch/structure").manualHandler("2023-11-08", "2023-11-09");
      break;
  }
  process.exit(0);
})();

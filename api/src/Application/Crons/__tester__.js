// To test run:
// node ./src/crons/__tester__.js patch/young

// You need to run in local apps and target the right database (Prod usually)

(async () => {
  await require("../../Infrastructure/Config/env-manager")();

  switch (process.argv[2]) {
    case "patch/young":
      await require("./Patchs/young").manualHandler("2023-11-08", "2023-11-09");
      break;
    case "refresh-materialized-views":
      await require("./Patchs/refresh-materialized-views").handler();
      break;
    case "patch/structure":
      await require("./Patchs/structure").manualHandler("2023-11-08", "2023-11-09");
      break;
  }
  process.exit(0);
})();

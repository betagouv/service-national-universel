const { ClasseModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const classeIds = [
      "66e1ac89d2e47db1985c904b",
      "668ea2c7c269e600463e42a8",
      "668ea2c6c269e600463e429e",
      "668ea382c269e600463e8aea",
      "668ea312c269e600463e607f",
      "66913ed90f15fe00460d0985",
      "668ea2e7c269e600463e4f12",
      "668ea2c6c269e600463e428b",
      "668ea326c269e600463e67a1",
      "668ea342c269e600463e738d",
      "668ea2d9c269e600463e4a5f",
      "66e1a7d1d2e47db1985b55f2",
    ];

    await ClasseModel.updateMany(
      {
        _id: { $in: classeIds },
      },
      {
        $set: { status: "OPEN" },
      },
    );
  },
};

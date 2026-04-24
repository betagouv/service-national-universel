require("../mongo");

const AgentModel = require("../models/agent");

async function main() {
  const result = await AgentModel.updateMany(
    { forgotPasswordResetToken: { $ne: "" } },
    { $set: { forgotPasswordResetToken: "", forgotPasswordResetExpires: null } }
  );

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        matchedCount: result.matchedCount ?? result.n ?? null,
        modifiedCount: result.modifiedCount ?? result.nModified ?? null,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });


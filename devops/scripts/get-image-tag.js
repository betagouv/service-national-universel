const { imageTag } = require("./lib/utils");
const UserInput = require("./lib/user-input");

function main() {
  const input = new UserInput(`Get image tag from commit sha`)
    .arg("commit", "Commit sha")
    .validate();

  const tag = imageTag(input.commit);
  console.log(tag);
}

if (require.main === module) {
  main();
}

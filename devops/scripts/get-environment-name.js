const { environmentFromBranch } = require("./lib/utils");
const UserInput = require("./lib/user-input");

function main() {
  const input = new UserInput(`Get environment name from branch name`)
    .arg("branch-name", "Name of the branch")
    .validate();

  const name = environmentFromBranch(input.branchName);
  console.log(name);
}

if (require.main === module) {
  main();
}

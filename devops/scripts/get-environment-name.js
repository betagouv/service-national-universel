const { environmentFromBranch } = require("./lib/utils");
const UserInput = require("./lib/user-input");

if (require.main === module) {
  const input = new UserInput(`Get environment name from branch name`)
    .arg("branch-name", "Name of the branch")
    .validate();

  const name = environmentFromBranch(input.branchName);
  console.log(name);
}
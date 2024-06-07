const ClasseObject = require("../../models/cle/classe");

async function createClasse(classe) {
  const classeCreated = await ClasseObject.create(classe);
  // Wait 100 ms to be sure that the center is created in the database
  await new Promise((resolve) => setTimeout(resolve, 100));
  return classeCreated;
}

module.exports = {
  createClasse,
};

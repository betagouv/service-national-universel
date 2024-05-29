const ClasseObject = require("../../models/cle/classe");

async function createClasse(classe) {
  const center = await classe.create(classe);
  // Wait 100 ms to be sure that the center is created in the database
  await new Promise((resolve) => setTimeout(resolve, 100));
  return center;
}

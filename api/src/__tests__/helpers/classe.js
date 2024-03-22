const ClasseObject = require("../../models/cle/classe");

async function getClasseHelper() {
  return await ClasseObject.find({});
}

async function getClasseByIdHelper(classeId) {
  return await ClasseObject.findById(classeId);
}

async function deleteClasseByIdHelper(classeId) {
  const young = await getClasseByIdHelper(classeId);
  if (young) await young.remove();
}

async function createClasseHelper(classe) {
  return await ClasseObject.create(classe);
}

async function updateClasseByIdHelper(classeId, updateData) {
  return await ClasseObject.findByIdAndUpdate(classeId, updateData, { new: true });
}

const notExistingClasseId = "104a49ba503040e4d2153000";

module.exports = {
  getClasseHelper,
  getClasseByIdHelper,
  deleteClasseByIdHelper,
  createClasseHelper,
  updateClasseByIdHelper,
  notExistingClasseId,
};

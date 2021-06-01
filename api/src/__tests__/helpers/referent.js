const ReferentObject = require("../../models/referent");

async function getReferentsHelper(){
  return await ReferentObject.find({});
}

async function getReferentByEmailHelper(referentEmail){
  return await ReferentObject.findOne({email : referentEmail.toLowerCase()});
}

async function deleteReferentByEmailHelper(referentEmail){
  const referent = await getReferentByEmailHelper(referentEmail);
  referent.remove();
}

async function createReferentHelper(referent){
  return await ReferentObject.create(referent);
}

module.exports = {
    getReferentsHelper,
    getReferentByEmailHelper,
    deleteReferentByEmailHelper,
    createReferentHelper
};
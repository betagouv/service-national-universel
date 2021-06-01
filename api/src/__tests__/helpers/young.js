const YoungObject = require("../../models/young");

async function getYoungsHelper(){
  return await YoungObject.find({});
}

async function getYoungByEmailHelper(youngEmail){
  return await YoungObject.findOne({email : youngEmail});
}

async function deleteYoungByEmailHelper(youngEmail){
  const young = await getYoungByEmailHelper(youngEmail);
  young.remove();
}

async function createYoungHelper(young){
  return await YoungObject.create(young);
}

module.exports = {
  getYoungsHelper,
  getYoungByEmailHelper,
  deleteYoungByEmailHelper,
  createYoungHelper
};
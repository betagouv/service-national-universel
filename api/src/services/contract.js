const { deletePatches } = require("../controllers/patches");
const { ContractModel } = require("../models");

const anonymizeContractsFromYoungId = async ({ youngId = "", anonymizedYoung = {} }) => {
  const contracts = await ContractModel.find({ youngId });

  console.log("ANONYMIZE YOUNGS CONTRACTS >>>", `${contracts.length} contracts found for young with id ${youngId}.`);

  if (!contracts.length) {
    return;
  }

  for (const contract of contracts) {
    contract.set({
      youngFirstName: anonymizedYoung.firstName,
      youngLastName: anonymizedYoung.lastName,
      youngEmail: anonymizedYoung.email,
      youngPhone: anonymizedYoung.phone,
      youngBirthdateAt: anonymizedYoung.birthdateAt,
      youngCity: anonymizedYoung.city,
      youngAddress: anonymizedYoung.address,
      youngDepartment: anonymizedYoung.department,
      parent1FirstName: anonymizedYoung.parent1FirstName,
      parent1LastName: anonymizedYoung.parent1LastName,
      parent1Address: anonymizedYoung.parent1Address,
      parent1City: anonymizedYoung.parent1City,
      parent1Department: anonymizedYoung.parent1Department,
      parent1Phone: anonymizedYoung.parent1Phone,
      parent1Email: anonymizedYoung.parent1Email,
      parent2FirstName: anonymizedYoung.parent2FirstName,
      parent2LastName: anonymizedYoung.parent2LastName,
      parent2Address: anonymizedYoung.parent2Address,
      parent2City: anonymizedYoung.parent2City,
      parent2Department: anonymizedYoung.parent2Department,
      parent2Phone: anonymizedYoung.parent2Phone,
      parent2Email: anonymizedYoung.parent2Email,
    });
    await contract.save();
    const deletePatchesResult = await deletePatches({ id: contract._id.toString(), model: ContractModel });
    if (!deletePatchesResult.ok) {
      console.error(`ERROR deleting patches of contract with id ${contract._id} >>>`, deletePatchesResult.code);
    }
  }

  console.log("ANONYMIZE YOUNGS CONTRACTS >>>", `${contracts.length} contracts anonymized for young with id ${youngId}.`);
};

module.exports = {
  anonymizeContractsFromYoungId,
};

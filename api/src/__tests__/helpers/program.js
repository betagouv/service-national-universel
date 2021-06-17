const ProgramObject = require("../../models/program");

async function getProgramsHelper() {
  return await ProgramObject.find({});
}

async function getProgramByIdHelper(programId) {
  return await ProgramObject.findOne({ _id: programId });
}

async function deleteProgramByIdHelper(programId) {
  const program = await getProgramByIdHelper(programId);
  await program.remove();
}

async function createProgramHelper(program) {
  return await ProgramObject.create(program);
}

function expectProgramToEqual(program, expectedProgram) {
  expect(program.name).toEqual(expectedProgram.name);
  expect(program.department).toEqual(expectedProgram.department);
  expect(program.region).toEqual(expectedProgram.region);
  expect(program.type).toEqual(expectedProgram.type);
  expect(program.url).toEqual(expectedProgram.url);
  expect(program.descriptionDuration).toEqual(expectedProgram.descriptionDuration);
  expect(program.descriptionMoney).toEqual(expectedProgram.descriptionMoney);
  expect(program.descriptionFor).toEqual(expectedProgram.descriptionFor);
}

module.exports = {
  getProgramsHelper,
  getProgramByIdHelper,
  deleteProgramByIdHelper,
  createProgramHelper,
  expectProgramToEqual,
};

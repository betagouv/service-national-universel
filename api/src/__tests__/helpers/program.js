const ProgramObject = require("../../models/program");

async function getProgramsHelper() {
  return await ProgramObject.find({});
}

async function getProgramByNameHelper(programName) {
  return await ProgramObject.findOne({ name: programName });
}

async function deleteProgramByNameHelper(programName) {
  const program = await getProgramByNameHelper(programName);
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
  getProgramByNameHelper,
  deleteProgramByNameHelper,
  createProgramHelper,
  expectProgramToEqual,
};

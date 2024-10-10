import { ProgramModel } from "../../models";

async function getProgramsHelper() {
  return await ProgramModel.find({});
}

async function getProgramByIdHelper(programId) {
  return await ProgramModel.findById(programId);
}

async function deleteProgramByIdHelper(programId) {
  const program = await getProgramByIdHelper(programId);
  await program?.deleteOne();
}

async function createProgramHelper(program) {
  return await ProgramModel.create(program);
}

async function deleteAllProgram() {
  await ProgramModel.deleteMany({});
}

function expectProgramToEqual(program, expectedProgram) {
  // Need to parse the objects because attributes types changed
  // Deep equal failed on Date which became string
  const programParsed = JSON.parse(JSON.stringify(program));
  const expectedProgramParsed = JSON.parse(JSON.stringify(expectedProgram));
  expect(programParsed.name).toEqual(expectedProgramParsed.name);
  expect(programParsed.department).toEqual(expectedProgramParsed.department);
  expect(programParsed.region).toEqual(expectedProgramParsed.region);
  expect(programParsed.type).toEqual(expectedProgramParsed.type);
  expect(programParsed.url).toEqual(expectedProgramParsed.url);
  expect(programParsed.description).toEqual(expectedProgramParsed.description);
  expect(programParsed.descriptionDuration).toEqual(expectedProgramParsed.descriptionDuration);
  expect(programParsed.descriptionMoney).toEqual(expectedProgramParsed.descriptionMoney);
  expect(programParsed.descriptionFor).toEqual(expectedProgramParsed.descriptionFor);
}

const notExisitingProgramId = "123a49ba503040e4d2153944";

export { getProgramsHelper, getProgramByIdHelper, deleteProgramByIdHelper, createProgramHelper, expectProgramToEqual, deleteAllProgram, notExisitingProgramId };

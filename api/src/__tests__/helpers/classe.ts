import { ClasseModel } from "../../models";

export async function createClasse(classe: any): Promise<any> {
  const classeCreated = await ClasseModel.create(classe);
  // Wait 100 ms to be sure that the center is created in the database
  await new Promise((resolve) => setTimeout(resolve, 100));
  return classeCreated;
}

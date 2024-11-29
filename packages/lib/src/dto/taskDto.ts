import { TaskStatus } from "../constants/task";

export type TaskMetadataDto<T, U> = {
  parameters?: T;
  results?: U;
};

export interface TaskDto<T = object, U = object> {
  id: string;
  name: string;
  status: TaskStatus;
  metadata?: TaskMetadataDto<T, U>;
  erreur?: {
    code?: string;
    description?: string;
  };
  libelle?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

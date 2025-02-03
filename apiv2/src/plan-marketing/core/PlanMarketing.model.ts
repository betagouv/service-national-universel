import { CreateTaskModel, TaskModel } from "@task/core/Task.model";

export interface PlanMarketingTaskMetadata {
    processId: number;
    nomListe: string;
    campagneId: string;
}

export interface PlanMarketingTaskResults {}

export interface PlanMarketingTaskModel extends TaskModel<PlanMarketingTaskMetadata, PlanMarketingTaskResults> {}

export interface PlanMarketingCreateTaskModel
    extends CreateTaskModel<PlanMarketingTaskMetadata, PlanMarketingTaskResults> {}

import { CreateTaskModel, TaskModel } from "@task/core/Task.model";

export interface PlanMarketingTaskParameters {
    processId: number;
    nomListe: string;
    campagneId: string;
}

export interface PlanMarketingTaskResults {
    description: string;
}

export interface PlanMarketingTaskModel extends TaskModel<PlanMarketingTaskParameters, PlanMarketingTaskResults> {}

export interface PlanMarketingCreateTaskModel
    extends CreateTaskModel<PlanMarketingTaskParameters, PlanMarketingTaskResults> {}

import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskModel } from "@task/core/Task.model";
import { SuperAdminGuard } from "../../iam/guard/SuperAdmin.guard";

@Controller("task")
export class AdminTaskController {
    constructor(@Inject(TaskGateway) private taskGateway: TaskGateway) {}

    @Get("/")
    @UseGuards(SuperAdminGuard)
    findAll(): Promise<TaskModel[]> {
        return this.taskGateway.findAll();
    }

    @Get(":id")
    @UseGuards(SuperAdminGuard)
    verify(@Param("id") id: string): Promise<TaskModel> {
        return this.taskGateway.findById(id);
    }
}

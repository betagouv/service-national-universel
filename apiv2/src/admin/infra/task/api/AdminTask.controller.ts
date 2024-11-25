import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";
import { CreateTaskModel, TaskModel } from "@task/core/Task.model";
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

    // TODO for testing purposes only => REMOVE
    @Post("/")
    @UseGuards(SuperAdminGuard)
    create(@Body() task: CreateTaskModel): Promise<TaskModel> {
        return this.taskGateway.create(task);
    }
}

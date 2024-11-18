import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { CreateTaskModel, TaskModel } from "@task/core/Task.model";
import { AdminTaskRepository } from "../AdminTaskMongo.repository";
import { SuperAdminGuard } from "../../iam/guard/SuperAdmin.guard";

@Controller("task")
export class AdminTaskController {
    constructor(private adminTaskRepository: AdminTaskRepository) {}

    @Get("/")
    @UseGuards(SuperAdminGuard)
    findAll(): Promise<TaskModel[]> {
        return this.adminTaskRepository.findAll();
    }

    @Get(":id")
    @UseGuards(SuperAdminGuard)
    verify(@Param("id") id: string): Promise<TaskModel> {
        return this.adminTaskRepository.findById(id);
    }

    // TODO for testing purposes only => REMOVE
    @Post("/")
    @UseGuards(SuperAdminGuard)
    create(@Body() task: CreateTaskModel): Promise<TaskModel> {
        return this.adminTaskRepository.create(task);
    }
}

import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";
import { TaskName, TaskStatus } from "../constants/task";

export const TaskSchema = {
  name: {
    type: String,
    enum: Object.values(TaskName),
    required: true,
  },

  libelle: {
    type: String,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
  },

  status: {
    type: String,
    enum: Object.values(TaskStatus),
    required: true,
  },

  metadata: {
    type: Object,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(TaskSchema);
export type TaskType = InterfaceExtended<InferSchemaType<typeof schema>>;

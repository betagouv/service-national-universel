import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const operationSchema = new mongoose.Schema({
  op: { type: String, required: true },
  path: { type: String, required: true },
  value: { type: String, required: true },
  originalValue: { type: String },
});

export const PatchSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  ops: { type: [operationSchema], required: true },
  ref: { type: mongoose.Schema.Types.ObjectId, required: true },
  modelName: { type: String, required: true },
  user: { type: userSchema },
  date: { type: Date, required: true },
  __v: { type: Number, default: 0 },
});

export type PatchType = InferSchemaType<typeof PatchSchema>;

import mongoose, { InferSchemaType } from "mongoose";

export const PatchUserSchema = {
  email: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
};

export const PatchOperationSchema = {
  op: { type: String, required: true },
  path: { type: String, required: true },
  value: { type: String },
  originalValue: { type: String },
};

export const PatchSchema = {
  ops: { type: [PatchOperationSchema], required: true },
  ref: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  modelName: { type: String, required: true },
  user: { type: PatchUserSchema },
  date: { type: Date, required: true, default: Date.now },
};

const schema = new mongoose.Schema({
  ...PatchSchema,
  user: {
    ...PatchSchema.user,
    type: new mongoose.Schema(PatchUserSchema),
  },
  ops: {
    ...PatchSchema.ops,
    type: [new mongoose.Schema(PatchOperationSchema)],
  },
});

export type PatchType = InferSchemaType<typeof schema>;

import { MONGO_COLLECTION } from "../../mongoSchema";

// Mongo collection from MODELNAME of api/src/models/*
export const PERMISSION_RESOURCES_COLLECTION = MONGO_COLLECTION;

export const PERMISSION_RESOURCES_SCRIPT = {
  AFFECTER_HTS: "AFFECTER_HTS",
} as const;

export const PERMISSION_RESOURCES_LIST = [...Object.values(PERMISSION_RESOURCES_COLLECTION), ...Object.values(PERMISSION_RESOURCES_SCRIPT)];

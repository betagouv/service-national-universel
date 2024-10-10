import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const SessionPhase1TokenSchema = {
  token: {
    type: String,
    documentation: {
      description: "Token de session publique",
    },
  },

  startAt: {
    type: Date,
    documentation: {
      description: "Date de debut validité du token",
    },
  },

  expireAt: {
    type: Date,
    documentation: {
      description: "Date de fin validité du token",
    },
  },

  sessionId: {
    type: String,
    documentation: {
      description: "Id de session",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(SessionPhase1TokenSchema);
export type SessionPhase1TokenType = InterfaceExtended<InferSchemaType<typeof schema>>;

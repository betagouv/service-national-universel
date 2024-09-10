import { Document, SaveOptions } from "mongoose";

export type UserSaved = Partial<{ _id; role; department; region; email; firstName; lastName; model }>;
export type UserExtension = { user?: UserSaved; _user?: UserSaved; fromUser?: UserSaved };
export type InterfaceExtended<T> = T & { _id: string; _doc?: T }; // TODO: remove this one (only available in snu-lib)
export type DocumentExtended<T> = Document &
  T & {
    save(params: CustomSaveParams): Promise<Document & T>;
  };
export type CustomSaveParams = SaveOptions & { fromUser?: UserSaved };

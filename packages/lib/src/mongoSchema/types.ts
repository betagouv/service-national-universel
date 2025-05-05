import { Document, SaveOptions } from "mongoose";

export type User = Partial<{ _id; role; department; region; email; firstName; lastName; model }>;
export type UserSaved = User & {
  impersonatedBy?: User;
};
export type UserExtension = { user?: UserSaved; _user?: UserSaved; fromUser?: UserSaved };
export type DocumentExtended<T> = Document &
  T & {
    save(params: CustomSaveParams): Promise<Document & T & { _doc?: T }>;
    _doc?: T;
  };
export type CustomSaveParams = SaveOptions & { fromUser?: UserSaved };

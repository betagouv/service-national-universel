import { Request } from "express";
import { UserDto } from "snu-lib";

export interface UserRequest extends Request {
  user: UserDto;
  files?: any;
}

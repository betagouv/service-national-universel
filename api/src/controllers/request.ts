import { Request, Response } from "express";
import { UserDto, BasicRoute } from "snu-lib";

export interface UserRequest<T = {}> extends Request {
  user: UserDto;
  files?: any;
}

export type RouteRequest<T extends BasicRoute> = UserRequest & Request<T["params"], T["response"], T["payload"], T["query"]>;

export type RouteResponse<T extends BasicRoute> = Response<T["response"]>;

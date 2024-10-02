import { Request, Response } from "express";
import { UserDto, BasicRoute } from "snu-lib";

export interface UserRequest extends Request {
  user: UserDto;
  files?: any;
}

// @ts-expect-error params is optional
export interface RouteRequest<T extends BasicRoute> extends UserRequest {
  body: T["payload"];
  query: T["query"];
  params: T["params"];
  validatedBody: NonNullable<T["payload"]>;
  validatedQuery: NonNullable<T["query"]>;
  validatedParams: NonNullable<T["params"]>;
}
export interface RouteResponse<T extends BasicRoute> extends Response<T["response"]> {
  json: (body: T["response"]) => this;
}

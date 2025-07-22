import { Request } from "express";

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departments?: string[];
  region?: string;
}

export interface ElasticsearchQuery {
  sort: any[];
  query: {
    bool: {
      must: any[];
      must_not: any[];
    };
  };
  size: number;
  from: number;
  track_total_hits: boolean;
}

export interface UserRequest extends Request {
  user: User;
}

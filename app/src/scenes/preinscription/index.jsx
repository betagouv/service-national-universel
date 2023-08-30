import React from "react";
import { environment } from "../../config";
import IndexOld from "./indexOld";
import IndexNew from "./indexNew";

export default function Index() {
  return environment === "production" ? <IndexOld /> : <IndexNew />;
}

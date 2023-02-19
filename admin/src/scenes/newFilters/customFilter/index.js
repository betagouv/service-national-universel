import React from "react";
import Example from "./example";

export function getCustomComponent(component) {
  switch (component) {
    case "example":
      return <Example />;
    default:
      return null;
  }
}

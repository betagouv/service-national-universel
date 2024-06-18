import React from "react";

interface proptype {
  children?: React.ReactNode;
}

export default function Hint({ children }: proptype) {
  return <p style={{ color: "#a0aec1", fontSize: 12 }}>{children}</p>;
}

import React from "react";

export default function Bug() {
  // eslint-disable-next-line no-undef
  return <button onClick={() => methodDoesNotExistWithSourceMapUpdated()}>Break the world</button>;
}

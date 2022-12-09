import React from "react";
import Historic from "../../../components/views/Historic2";

export default function Historic() {
  const [data, setData] = React.useState(null);

  // Insert fetch and format logic here

  return <p>{JSON.stringify(data)}</p>;
  // return <Historic />;
}
